import type { OutputOptions, RollupBuild } from 'rollup';

export default function writeBundles(bundle: RollupBuild, options: OutputOptions[]) {
  return Promise.all(options.map((option) => bundle.write(option)));
}
