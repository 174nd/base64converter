import inquirer from 'inquirer';
import { join } from "path";
import mime from "mime-types";
import fs from 'fs';
import chalk from 'chalk';

function getFiles(dir) {
  return new Promise((resolve) => {
    fs.readdir(dir, (err, files) => {
      resolve(files.filter(x => dir == '.' && ![
        'index.js',
        'node_modules',
        'package-lock.json',
        'package.json',
      ].includes(x)));
    })
  });
}

async function ask() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'directory',
      message: 'Chose Directory',
    }
  ]).then(async ans1 => {
    if(fs.existsSync(ans1.directory)){
      const data = await getFiles(ans1.directory);
      if(data.length > 0){
        inquirer.prompt([
          {
            type: 'list',
            name: 'files',
            message: 'Chose File To Convert',
            choices: data,
          }
        ]).then(ans2 => {
          const fileName = ans2.files.split('.').shift();
          inquirer.prompt([
            {
              type: 'input',
              name: 'convertName',
              message: 'Input convert File Name',
              default: fileName,
            }
          ]).then(ans3 => {
            if(ans3.convertName + '.txt' != ans2.files){
              const contents = fs.readFileSync(join(process.cwd(), ans1.directory, ans2.files), {encoding: 'base64'}),
              mimeType = mime.contentType(ans2.files);
  
              fs.writeFileSync(ans3.convertName + '.txt', `data:${mimeType};base64,${contents}`);
              console.log(`${chalk.bgGreen(ans2.files)} convert to base64 in ${chalk.bgBlue('./' + ans3.convertName + '.txt')}`);
            }else{
              console.log(chalk.red('Original File Name and Convert Base64 File Name are same!'));
            }
          });
        });
      }else{
        console.log(chalk.red('File Not Found!'));
      }
    }else{
      console.log(chalk.red('Directory Not Found!'));
    }
  });
}

ask();
