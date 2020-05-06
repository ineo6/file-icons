#!/usr/bin/env node
'use strict'

const path = require('path');
const chalk = require('chalk');
const fsExtra = require('fs-extra');
const fs = require('fs');
const os = require('os');
// const shell = require('shelljs');
const ora = require('ora');
const download = require('download-git-repo');
const processFonts = require('./processLess');

const cwd = process.cwd();
const origin = 'file-icons/atom';

const branch = "#master";

const targetPath = path.join(cwd, 'lib');

const tmpDirPrefix = path.join(os.tmpdir(), '.tmp');

const tmpDir = fs.mkdtempSync(tmpDirPrefix);

const spinner = ora(`downloading ${origin}...`);
spinner.start();

download(`${origin}${branch}`, tmpDir, { clone: false }, function (err) {
    spinner.stop();
    if (err) {
        console.log(chalk.red(`Failed to download repo https://github.com/${origin}${branch}`, err));
    } else {
        console.log(chalk.green(`Success to download repo https://github.com/${origin}${branch}`));

        const spinnerExtract = ora('Extract Data...');
        spinnerExtract.start();

        try {
            fsExtra.copySync(path.join(tmpDir, 'fonts'), path.join(targetPath, 'fonts'));
            fsExtra.copySync(path.join(tmpDir, 'styles'), path.join(targetPath, 'styles'));
            fsExtra.copySync(path.join(tmpDir, 'lib/icons'), path.join(targetPath, 'icons'));
            fsExtra.copySync(path.join(tmpDir, 'lib/utils.js'), path.join(targetPath, 'utils.js'));

            // append
            fsExtra.copySync(path.join(cwd, 'resource/mixins.less'), path.join(targetPath, 'styles/mixins.less'));
            fsExtra.copySync(path.join(cwd, 'resource/octicons.less'), path.join(targetPath, 'styles/octicons.less'));
            fsExtra.copySync(path.join(cwd, 'resource/octicons.woff2'), path.join(targetPath, 'fonts/octicons.woff2'));

            // transform less file
            processFonts(path.join(targetPath, 'styles/fonts.less'))

            spinnerExtract.stop();
            console.log(chalk.green('Done!'));
        } catch (e) {
            spinnerExtract.stop();
            console.log(e.message);
        }
    }
})
