import { assert, describe, it } from 'vitest';

import { isValidVersion, isVersionNewer } from './utils';

describe('versionUtils.ts', () => {
  describe('isValidVersion', () => {
    it('should return true for valid version strings', () => {
      assert(isValidVersion('1.0.0') === true);
      assert(isValidVersion('12.34.56') === true);
      assert(isValidVersion('0.0.1') === true);
    });

    it('should return false for invalid version strings', () => {
      assert(isValidVersion('') === false);
      assert(isValidVersion(undefined) === false);
      assert(isValidVersion('1.0') === false);
      assert(isValidVersion('1.0.0.0') === false);
      assert(isValidVersion('1.a.0') === false);
    });
  });

  describe('isVersionNewer', () => {
    it('should return true if remote version is newer', () => {
      assert(
        isVersionNewer({ remoteVersion: '2.0.0', localVersion: '1.0.0' }) ===
          true
      );
      assert(
        isVersionNewer({ remoteVersion: '1.1.0', localVersion: '1.0.9' }) ===
          true
      );
      assert(
        isVersionNewer({ remoteVersion: '1.0.1', localVersion: '1.0.0' }) ===
          true
      );
    });

    it('should return false if remote version is older or the same', () => {
      assert(
        isVersionNewer({ remoteVersion: '1.0.0', localVersion: '1.0.0' }) ===
          false
      );
      assert(
        isVersionNewer({ remoteVersion: '1.0.0', localVersion: '2.0.0' }) ===
          false
      );
      assert(
        isVersionNewer({ remoteVersion: '1.0.0', localVersion: '1.1.0' }) ===
          false
      );
    });

    it('should throw an error for invalid version strings', () => {
      try {
        isVersionNewer({ remoteVersion: '', localVersion: '1.0.0' });
        assert(false, 'Expected error for invalid remote version');
      } catch (e) {
        assert(e instanceof Error);
      }

      try {
        isVersionNewer({ remoteVersion: '1.0.0', localVersion: '' });
        assert(false, 'Expected error for invalid local version');
      } catch (e) {
        assert(e instanceof Error);
      }

      try {
        isVersionNewer({ remoteVersion: '1.x.0', localVersion: '1.0.0' });
        assert(false, 'Expected error for invalid remote version');
      } catch (e) {
        assert(e instanceof Error);
      }
    });
  });
});
