import test from "node:test";
import { factory, runTasks } from "release-it/test/util/index.js";
import assert from "node:assert";
import BlueHaloCalVer from "./bh-calver";

const namespace = "my-plugin";

test("bh-calver should not throw", async () => {
  const options = { [namespace]: {} };
  const plugin = factory(BlueHaloCalVer, { namespace, options });
  assert.doesNotReject(runTasks(plugin));
});
