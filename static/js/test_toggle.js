const semgrepIntegration = {
    delimiters: ['[[', ']]'],
    props: ['instance_name', 'section', 'selected_integration', 'is_selected', 'integration_data'],
    emits: ['set_data', 'clear_data'],
    data() {
        return this.initialState()
    },
    computed: {
        body_data() {
            const {
                description,
                is_default,
                selected_integration: id,
                ruleset,
                save_intermediates_to,
                timeout,
                timeout_threshold,
            } = this
            return {
                description,
                is_default,
                id,
                ruleset,
                save_intermediates_to,
                timeout,
                timeout_threshold,

            }
        },
    },
    watch: {
        selected_integration(newState, oldState) {
            console.debug('watching selected_integration: ', oldState, '->', newState, this.integration_data)
            this.set_data(this.integration_data?.settings, false)
        }
    },
    methods: {
        get_data() {
            if (this.is_selected) {
                return this.body_data
            }
        },
        set_data(data, emit = true) {
            Object.assign(this.$data, data)
            emit&& this.$emit('set_data', data)
        },
        clear_data() {
            Object.assign(this.$data, this.initialState())
            this.$emit('clear_data')
        },

        handleError(response) {
            try {
                response.json().then(
                    errorData => {
                        errorData.forEach(item => {
                            console.debug('semgrep item error', item)
                            this.error = {[item.loc[0]]: item.msg}
                        })
                    }
                )
            } catch (e) {
                alertCreateTest.add(e, 'danger-overlay')
            }
        },

        initialState: () => ({
            // toggle: false,
            error: {},
            save_intermediates_to: '/data/intermediates/sast',
            ruleset: '/opt/semgrep/rulesets/findsecbugs.yml',
            timeout: 15,
            timeout_threshold: 5,
        })
    },
    template: `
        <div class="mt-3">
            <div class="row">
                <div class="col">
                    <h7>Advanced Settings</h7>
                    <p>
                        <h13>Integration default settings can be overridden here</h13>
                    </p>
                </div>
            </div>
            <div class="form-group">
                <form autocomplete="off">
                    <h9>Ruleset</h9>
                    <p>
                        <h13>Path to ruleset.yml</h13>
                    </p>
                    <input type="text" class="form-control form-control-alternative"
                        placeholder=""
                        v-model="ruleset"
                        :class="{ 'is-invalid': error.ruleset }">
                    <div class="invalid-feedback">[[ error.ruleset ]]</div>
                
                    <h9>Save intermediates to</h9>
                    <p>
                        <h13>Optional</h13>
                    </p>
                    <input type="text" class="form-control form-control-alternative"
                        placeholder=""
                        v-model="save_intermediates_to"
                        :class="{ 'is-invalid': error.save_intermediates_to }">
                    <div class="invalid-feedback">[[ error.save_intermediates_to ]]</div>

                    <div class="form-group form-row">
                        <div class="col-6">
                            <h9>Timeout threshold</h9>
                            <p>
                                <h13>Optional</h13>
                            </p>
                            <input type="number" class="form-control form-control-alternative"
                                placeholder=""
                                v-model="timeout_threshold"
                                :class="{ 'is-invalid': error.timeout_threshold }"
                            >
                            <div class="invalid-feedback">[[ error.timeout_threshold ]]</div>
                        </div>
                        <div class="col-6">
                            <h9>Timeout</h9>
                            <p>
                                <h13>Optional</h13>
                            </p>
                            <input type="number" class="form-control form-control-alternative"
                                placeholder=""
                                v-model="timeout"
                                :class="{ 'is-invalid': error.timeout }"
                            >
                            <div class="invalid-feedback">[[ error.timeout ]]</div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `
}


register_component('scanner-semgrep', semgrepIntegration)

