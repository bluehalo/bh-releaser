"use strict";

import { Plugin } from "release-it";
import calver from "calver/node/lts";

const DEFAULT_FORMAT = "yy.mm.minor",
  DEFAULT_INCREMENT = "calendar.minor",
  FALLBACK_INCREMENT = "calendar.minor";

/**
 * This modifies https://github.com/casmith/release-it-calver-plugin
 * to handle invalid existing versions.
 */
export default class BlueHaloCalVer extends Plugin {
  getFormat() {
    return this.getContext().format || DEFAULT_FORMAT;
  }

  getInc() {
    return this.getContext().increment || DEFAULT_INCREMENT;
  }

  getFallbackInc() {
    return this.getContext().fallbackIncrement || FALLBACK_INCREMENT;
  }

  getIncrementedVersion(args) {
    const { latestVersion } = args || {};
    try {
      const version = calver.inc(
        this.getFormat(),
        latestVersion,
        this.getInc(),
      );
      return version;
    } catch (e) {
      try {
        const version = calver.inc(this.getFormat(), "", this.getInc());
        return version;
      } catch (e) {
        return latestVersion;
      }
    }
  }

  getIncrementedVersionCI() {
    return this.getIncrementedVersion(arguments[0]);
  }

  getIncrement() {
    return this.getInc();
  }
}
