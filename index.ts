import fs from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';
import { promisify } from 'node:util'
import { exec as execSync, spawn } from 'node:child_process';

import * as p from '@clack/prompts'

const exec = promisify(execSync)

interface EnvFields {
  EXPO_PUBLIC_ENVIRONMENT: string;
  EXPO_PUBLIC_VERSION: string;
  BUILD_NUMBER: string;
  BUNDLE_IDENTIFIER: string;
  VERSION_CODE: string;
}

interface EasProperties {
  build: {
    preview: {
      env: EnvFields
    },
    production: {
      env: EnvFields
    }
  }
}

type Version = 'buildNumber' | 'bugfix' | 'minor' | 'major';
type Environment = 'production' | 'preview';

interface FormattedArguments {
  version?: Version;
  environment: Environment;
}

async function main() {
  console.clear();

  await setTimeout(1000);

  p.intro(`eas-update-app-util`)

  const project = await p.group({
    environment: () =>
      p.select({
        message: 'Select the environment where the APP will  be released',
        maxItems: 2,
        initialValue: 'preview',
        options: [
          { value: 'preview', label: 'Preview' },
          { value: 'production', label: 'Production' }
        ]
      }),
    version: () =>
      p.select({
        message: 'Select a version number',
        initialValue: 'bugfix',
        options: [
          { value: 'bugfix', label: 'Bugfix (X.X.+1)' },
          { value: 'minor', label: 'Minor (X.+1.0)' },
          { value: 'major', label: 'Major (+1.0.0)' },
          { value: 'buildNumber', label: 'BuildNumber/VersionCode' },
          { value: 'manual', label: 'Insert manually' }
        ]
      }),
    customVersion: ({ results }) => {
      if (results.version == 'manual') {
        return p.text({
          message: 'Type the version number',
          placeholder: 'X.X.X',
          validate: (value) => {
            const breakValue = value.split('.')
            const isNumber = breakValue.every(item => !isNaN(Number(item)))
            if (!isNumber) return 'Please only insert numeric values'
            const isVersioned = breakValue.length === 3;
            if (!isVersioned) return 'Please utilize semantic versioning'
          },
        })
      }
    }
  })

  await updateProjectVersion({
    environment: project.environment as Environment,
    version: project.customVersion as Version || project.version,
  })

  const deploy = await p.group({

    deploy: () =>
      p.multiselect({
        required: false,
        message: 'Where do you want to deploy your app',
        options: [
          { value: 'ios', label: 'iOS' },
          { value: 'android', label: 'Android' }
        ]
      }),
  })
  p.outro(`Version increased successfuly! ${deploy.deploy.length > 0 ? 'Starting deploy...' : ''}`)

  if (deploy.deploy.some(item => !!item)) {
    const platforms = deploy.deploy.reduce((acc, curr) => {
      return acc ? 'all' : curr
    }, '')
    const easBuild = spawn(`eas`, ["build", `--profile=${project.environment}`, "--auto-submit", "--non-interactive", `--platform=${platforms}`], { shell: true })

    easBuild.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    easBuild.stderr.on('data', (data) => {
      console.error(data.toString())
    })

    easBuild.stderr.on('close', (code) => {
      console.log("🚀 ~ easBuild.stderr.on ~ code:", code)
      console.log(!code ? `Deploy failed\n
If the error was at the build stage you can run it manually  with:\n
npx eas build --profile=${project.environment} --auto-submit --non-interactive --platform=${platforms}\n
or\n
npx eas build --profile=${project.environment} --auto-submit --platform=${platforms}\n\n
If error ocurred on submit you may have to check your metadata and rebuild, or run the command:\n
npx eas submit --profile=${project.environment} --platform=${platforms}` : 'Deploy feito com sucesso')

      return;
    })
  }

}

async function updateProjectVersion(args: FormattedArguments) {
  try {
    const easFile = await fs.readFile('./eas.json', 'utf8',)
    const easObject: EasProperties = JSON.parse(easFile)

    changeVersion(easObject, args)

    await fs.writeFile('./eas.json', JSON.stringify(easObject, null, 2), 'utf8')
  } catch (err) {
    console.error('Um erro ocorreu', err)
  }
}

function parseArguments(args: string[]) {
  const argsF = args.slice(2).map(item => item.split('='));

  const argsObj = Object.fromEntries(argsF)

  return argsObj;
}

function changeVersion(easObject: EasProperties, args: FormattedArguments) {
  if (!args.version) {
    console.info('Não houvem mudança de versão')
    return
  }
  let version: number[] | null = easObject.build[args.environment].env.EXPO_PUBLIC_VERSION.split('.').map(Number);

  let env = easObject.build[args.environment].env;

  switch (args.version) {
    case 'major':
      version[0]++;
      version[1] = 0;
      version[2] = 0;
      env.BUILD_NUMBER = "1"
      env.VERSION_CODE = String(Number(env.VERSION_CODE) + 1)
      break
    case 'minor':
      version[1]++;
      version[2] = 0;
      env.BUILD_NUMBER = "1"
      env.VERSION_CODE = String(Number(env.VERSION_CODE) + 1)
      break
    case 'bugfix':
      version[2]++;
      env.BUILD_NUMBER = "1"
      env.VERSION_CODE = String(Number(env.VERSION_CODE) + 1)
      break
    case 'buildNumber':
      env.VERSION_CODE = String(Number(env.VERSION_CODE) + 1)
      env.BUILD_NUMBER = String(Number(env.BUILD_NUMBER) + 1)
      break
    default:
      env.EXPO_PUBLIC_VERSION = args.version;
      version = null;
      env.BUILD_NUMBER = "1"
      env.VERSION_CODE = String(Number(env.VERSION_CODE) + 1)
      break
  }

  env.EXPO_PUBLIC_VERSION = version ? version.join('.') : env.EXPO_PUBLIC_VERSION;

  console.info(`Versão do APP atualizada para ${env.EXPO_PUBLIC_VERSION}`)
}

main();
