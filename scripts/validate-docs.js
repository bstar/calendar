/*
 Simple validation for docs/stories to enforce canonical restriction naming and shapes.
 - Flags: type: 'boundary' with minDate/maxDate usage
 - Flags: camelCased restriction types in docs (allowedRanges, restrictedBoundary)
*/

const fs = require('fs');
const path = require('path');
const glob = require('glob');

function scanFiles(patterns) {
  const files = patterns.flatMap((p) => glob.sync(p, { nodir: true }));
  const issues = [];

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');

    // 1) boundary + minDate/maxDate
    const boundaryWithMinMax = /type\s*:\s*['\"]boundary['\"][\s\S]{0,120}?(minDate|maxDate)\s*:/g;
    if (boundaryWithMinMax.test(content)) {
      issues.push(`${file}: boundary restriction should use date + direction, not minDate/maxDate`);
    }

    // 2) camelCased restriction names
    if (/allowedRanges\b/.test(content)) {
      issues.push(`${file}: use 'allowedranges' not 'allowedRanges'`);
    }
    if (/restrictedBoundary\b/.test(content)) {
      issues.push(`${file}: use 'restricted_boundary' not 'restrictedBoundary'`);
    }
  });

  return issues;
}

function main() {
  const patterns = [
    'README.md',
    'src/stories/**/*.mdx',
    'src/stories/**/*.tsx',
  ];
  const issues = scanFiles(patterns);
  if (issues.length) {
    console.error('\nDoc validation issues found:');
    for (const i of issues) console.error(' -', i);
    process.exit(1);
  } else {
    console.log('Docs validation passed.');
  }
}

if (require.main === module) {
  main();
}
