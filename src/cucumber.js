const DEFAULT_TIMEOUT = 60000;

const commonConfig = {
    paths: ['features/**/*.feature'],
    tags: 'not @wip and not @manual',
    parallel: 1,
    timeout: DEFAULT_TIMEOUT
};

const config = {
    default: {
        ...commonConfig,
        require: ['dist/features/step_definitions/**/*.js', 'dist/features/support/**/*.js'],
        format: ['progress-bar', 'html:cucumber-report.html', 'json:cucumber-report.json'],
        failFast: false,
        retry: 0
    },
    dev: {
        ...commonConfig,
        require: ['features/step_definitions/**/*.ts', 'features/support/**/*.ts'],
        requireModule: ['ts-node/register'],
        format: ['progress-bar'],
        failFast: true,
        retry: 1
    }
};

module.exports = config;