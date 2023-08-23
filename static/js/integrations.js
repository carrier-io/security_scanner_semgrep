const semgrepIntegration = {
    delimiters: ['[[', ']]'],
    components: {
        SecretFieldInput: SecretFieldInput
    },
    props: ['instance_name', 'display_name', 'default_template', 'logo_src', 'section_name'],
    emits: ['update'],
    template: `
<div
    :id="modal_id"
    class="modal modal-small fixed-left fade shadow-sm" tabindex="-1" role="dialog"
>
    <ModalDialog
            v-model:name="config.name"
            v-model:is_default="is_default"
            @update="update"
            @create="create"
            :display_name="display_name"
            :id="id"
            :is_fetching="is_fetching"
            :is_default="is_default"
    >
        <template #body>
            <div class="form-group">
                <h9>Ruleset</h9>
                <p>
                    <h13>Path to ruleset.yml</h13>
                </p>
                <input type="text" class="form-control form-control-alternative"
                    placeholder=""
                    v-model="ruleset"
                    :class="{ 'is-invalid': error.ruleset }">
                <div class="invalid-feedback">[[ error.ruleset ]]</div>

                <!--<h9>Save intermediates to</h9>
                <p>
                    <h13>Optional</h13>
                </p>
                <input type="text" class="form-control form-control-alternative"
                       placeholder=""
                       v-model="save_intermediates_to"
                       :class="{ 'is-invalid': error.save_intermediates_to }">
                <div class="invalid-feedback">[[ error.save_intermediates_to ]]</div>-->

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
            </div>
        </template>
        <template #footer>
            <test-connection-button
                    :apiPath="this.$root.build_api_url('integrations', 'check_settings') + '/' + pluginName"
                    :error="error.check_connection"
                    :body_data="body_data"
                    v-model:is_fetching="is_fetching"
                    @handleError="handleError"
            >
            </test-connection-button>
        </template>
    </ModalDialog>
</div>
    `,
    data() {
        return this.initialState()
    },
    mounted() {
        this.modal.on('hidden.bs.modal', e => {
            this.clear()
        })
    },
    computed: {
        project_id() {
            return getSelectedProjectId()
        },
        body_data() {
            const {
                config,
                is_default,
                project_id,

                ruleset,
                // save_intermediates_to,
                timeout,
                timeout_threshold,

                status,
            } = this
            return {
                config,
                is_default,
                project_id,

                ruleset,
                // save_intermediates_to,
                timeout,
                timeout_threshold,

                status,
            }
        },
        modal() {
            return $(this.$el)
        },
        modal_id() {
            return `${this.instance_name}_integration`
        }
    },
    methods: {

        clear() {
            Object.assign(this.$data, {
                ...this.$data,
                ...this.initialState(),
            })
        },
        load(stateData) {
            Object.assign(this.$data, {
                ...this.$data,
                ...stateData
            })
        },
        handleEdit(data) {
            console.debug('semgrep editIntegration', data)
            const {config, is_default, id, settings} = data
            this.load({...settings, config, is_default, id})
            this.modal.modal('show')
        },
        handleDelete(id) {
            this.load({id})
            this.delete()
        },
        handleSetDefault(id, local=true) {
            this.load({id})
            this.set_default(local)
        },
        create() {
            this.is_fetching = true
            fetch(this.api_url + this.pluginName, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.body_data)
            }).then(response => {
                this.is_fetching = false
                if (response.ok) {
                    this.modal.modal('hide')
                     this.$emit('update', {...this.$data, section_name: this.section_name})
                } else {
                    this.handleError(response)
                }
            })
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
                alertMain.add(e, 'danger-overlay')
            }
        },
        update() {
            this.is_fetching = true
            fetch(this.api_url + this.id, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.body_data)
            }).then(response => {
                this.is_fetching = false
                if (response.ok) {
                    this.modal.modal('hide')
                     this.$emit('update', {...this.$data, section_name: this.section_name})
                } else {
                    this.handleError(response)
                }
            })
        },
        delete() {
            this.is_fetching = true
            fetch(this.api_url + this.project_id + '/' + this.id, {
                method: 'DELETE',
            }).then(response => {
                this.is_fetching = false
                if (response.ok) {
                    delete this.$data['id']
                    this.$emit('update', {...this.$data, section_name: this.section_name})
                } else {
                    this.handleError(response)
                    alertMain.add(`Deletion error. <button class="btn btn-primary" @click="modal.modal('show')">Open modal<button>`)
                }
            })
        },
        async set_default(local) {
            this.is_fetching = true
            try {
                const resp = await fetch(this.api_url + this.project_id + '/' + this.id, {
                    method: 'PATCH',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({local})
                })
                if (resp.ok) {
                    this.$emit('update', {...this.$data, section_name: this.section_name})
                } else {
                    const error_data = await resp.json()
                    this.handleError(error_data)
                }
            } catch (e) {
                console.error(e)
                showNotify('ERROR', 'Error setting as default')
            } finally {
                this.is_fetching = false
            }
        },
        initialState: () => ({
            config: {},
            is_default: false,
            is_fetching: false,
            error: {},
            test_connection_status: 0,
            id: null,

            // save_intermediates_to: '/data/intermediates/sast',
            ruleset: '/opt/semgrep/rulesets/r2c-security-audit.yml',
            timeout: 3600,
            timeout_threshold: 1000,

            pluginName: 'security_scanner_semgrep',
            api_url: V.build_api_url('integrations', 'integration') + '/',
            status: integration_status.success,
        }),
    }
}

register_component('semgrepIntegration', semgrepIntegration)
