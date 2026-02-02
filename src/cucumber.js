const config = {
    default: {
        require: ['dist/features/step_definitions/**/*.js', 'dist/features/support/**/*.js'],
        format: ['progress-bar', 'html:cucumber-report.html', 'json:cucumber-report.json'],
        paths: ['features/**/*.feature'],
        failFast: false,
        parallel: 1,
        retry: 0,
        timeout: 60000
    },
    dev: {
        require: ['features/step_definitions/**/*.ts', 'features/support/**/*.ts'],
        requireModule: ['ts-node/register'],
        format: ['progress-bar'],
        paths: ['features/**/*.feature'],
        failFast: true,
        parallel: 1,
        retry: 1,
        timeout: 60000
    }
};

module.exports = config;