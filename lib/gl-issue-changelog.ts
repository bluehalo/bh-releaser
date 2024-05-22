import { Plugin } from "release-it";

/**
 *
 */
export default class GitlabIssueChangelog extends Plugin {
  init() {}

  get apiUrl() {
    return this.getContext().apiUrl;
  }

  get projectId() {
    return this.getContext().projectId;
  }

  async getChangelog() {
    const { git, latestTag } = this.config.getContext();
    const { changelog: cmd } = git;
    const context = { latestTag, from: latestTag, to: "HEAD" };

    const cmdoutput = await this.exec(cmd, {
      context,
      options: { write: false },
    });

    const text: string[] = [];
    const commits = cmdoutput.split("\n");
    const mriids = await this.fetchMergeRequestIds(commits);

    const issues = await this.getIssues(mriids);

    if (issues) {
      text.push("## Issues Addressed");
      for (const issue of issues.values()) {
        text.push(`[${issue.title}](${issue.web_url})  `);
      }
    }

    const glChangelog = text.join("\n");

    return glChangelog;
  }

  private getApiContext() {
    const { apiUrl, projectId } = this;
    if (!apiUrl) throw new Error("GitLab api url not specified");
    if (!projectId) throw new Error("GitLab project id not specified");
    return { apiUrl, projectId };
  }

  private async fetchMergeRequestIds(commits: string[]) {
    const { apiUrl, projectId } = this.getApiContext();
    const mriids = new Set<string>();
    for (const commit of commits) {
      if (!commit) continue;
      // for each commit, get any associated merge request iid
      const json = await this.fetchGlJson<{ iid: string }[]>(
        `${apiUrl}/projects/${projectId}/repository/commits/${commit}/merge_requests`,
      );

      for (const mr of json) {
        mriids.add(mr.iid);
      }
    }
    return mriids;
  }

  private async getIssues(mriids: Set<string>) {
    const { apiUrl, projectId } = this.getApiContext();
    const issues = new Map<number, Issue>();
    for (const miid of mriids) {
      // for each merge request, get the closed issues
      const json = await this.fetchGlJson<Issue[]>(
        `${apiUrl}/projects/${projectId}/merge_requests/${miid}/closes_issues`,
      );
      for (const issue of json) {
        issues.set(issue.iid, issue);
      }
    }
    return issues;
  }

  private async fetchGlJson<T>(url: string) {
    const token = this.getContext().token;
    if (!token) throw new Error("Missing gitlab token.");
    const result = await fetch(url, {
      headers: {
        "PRIVATE-TOKEN": token,
      },
    });

    if (result.status > 299)
      throw new Error(
        `API call ${url} failed with status: ${result.status} - ${result.statusText}`,
      );

    const json = await result.json();
    return json as T;
  }
}

interface Issue {
  iid: number;
  title: string;
  web_url: string;
}
