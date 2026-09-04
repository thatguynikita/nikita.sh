/* ================================================================
   scripts/lib/deploy-targets.mjs — the only part of deploying that
   differs between object stores.

   Everything else in scripts/deploy.mjs — the manifest walk, the
   allowlist, the content-type table, the dry run, the selective upload
   — is already target-agnostic. A target is just "which CLI, and what
   arguments does one PUT look like".

   GitHub Pages is deliberately NOT a target here: it publishes a
   directory as a build artifact rather than PUTting files one at a
   time, and it has no analogue of the content-type table (it sniffs
   types itself). It gets .github/workflows/pages.yml instead.
   ================================================================ */

export const TARGETS = {
  yandex: {
    label: "Yandex Object Storage",
    cli: "yc",
    // The bucket must already exist and be configured for static
    // hosting; this only uploads objects.
    args: ({ bucket, key, body, contentType, profile }) => [
      "storage", "s3api", "put-object",
      "--body", body,
      "--bucket", bucket,
      "--key", key,
      "--content-type", contentType,
      ...(profile ? ["--profile", profile] : []),
    ],
    profileEnv: "YC_PROFILE",
    profileFlag: "--profile",
    installHint: "https://yandex.cloud/en/docs/cli/quickstart",
  },

  aws: {
    label: "AWS S3",
    cli: "aws",
    args: ({ bucket, key, body, contentType, profile }) => [
      "s3api", "put-object",
      "--body", body,
      "--bucket", bucket,
      "--key", key,
      "--content-type", contentType,
      ...(profile ? ["--profile", profile] : []),
    ],
    profileEnv: "AWS_PROFILE",
    profileFlag: "--profile",
    installHint: "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html",
  },
};

export function resolveTarget(name) {
  const target = TARGETS[name];
  if (!target) {
    const known = Object.keys(TARGETS).join(", ");
    throw new Error(
      `Unknown deploy target "${name}". site.config.mjs's deploy.target must be one of: ${known}.\n` +
        `(GitHub Pages is not a deploy.mjs target — it publishes through .github/workflows/pages.yml.)`
    );
  }
  return target;
}
