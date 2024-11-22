import {defineComponent, onMounted, ref, toRaw, markRaw, watch, nextTick, inject, reactive} from "vue";
import {WarnTriangleFilled} from "@element-plus/icons-vue";
import './ResourceForm.scss';

import _ from "lodash-es";
import ResourceFormItem from "@/manage-vue/components/Resources/ResourceFormItem";
import {ElMessage} from "element-plus";

export default defineComponent({
    name: 'ResourceForm', props: {
        resource: {
            type: Object,
            required: true
        },
        columns: Array,
        tabs: {
            Array,
            default: null
        },
        labelPosition: {
            type: String,
            default: 'top'
        },
    }, emits: ['submit', 'change'], setup(props, {expose, emit}) {
        const formRef = ref(null);

        const tabs = ref(props.tabs);
        const activeTab = ref(0);

        const columns = ref(props.columns.filter(column => !column.disable));

        const resource = ref(_.cloneDeep(props.resource));

        const disabled = ref(false);

        const onChange = (path, newValue) => {
            let oldResource = _.cloneDeep(resource.value);
            _.set(resource.value, path, newValue);
            emit('change', resource.value, oldResource, onChange);
        }

        const renderFormItems = (columns) => {
            return (<el-row gutter={20}> {columns.map(c => <ResourceFormItem resource={resource.value} path={[c.prop]}
                                                                             onChange={onChange}
                                                                             {...c}/>)} </el-row>)
        }

        const submitFormItems = (r, p, columns) => {
            let submitResource = {};
            columns.forEach(column => {
                if (column.type === 'display')
                    return

                if (column.condition && !column.condition(resource.value))
                    return

                if (column.type === 'associations' || column.type === 'drag_images' || column.type === 'drag_files') {
                    _.set(submitResource, column.prop + '_attributes', _.get(r, [...p, ...[column.prop]]).map((item, i) => submitFormItems(r, [...p, ...[column.prop, i]], column.columns)))
                } else if (column.type === 'association') {
                    _.set(submitResource, column.prop + '_attributes', submitFormItems(r, [...p, ...[column.prop]], column.columns))
                } else {
                    _.set(submitResource, column.submit_prop ? column.submit_prop : column.prop, _.get(r, [...p, ...[column.prop]]))
                }
            })

            if (_.get(r, [...p, ...['_destroy']]) === true)
                _.set(submitResource, '_destroy', true)


            if (_.get(r, [...p, ...['id']]))
                _.set(submitResource, 'id', _.get(r, [...p, ...['id']]))

            return submitResource
        }

        const submit = () => {
            if (disabled.value) return
            // 归属某个tab下的验证，tab出现错误标识
            formRef.value.validate((valid, msg) => {
                if (valid) {
                    if (tabs.value) {
                        tabs.value.forEach((tab, i) => {
                            tabs.value[i].is_error = false
                        })
                    }

                    disabled.value = true
                    emit('submit', submitFormItems(resource.value, [], props.columns), () => {
                        disabled.value = false;
                    })
                } else {
                    if (tabs.value) {
                        let mKeys = Object.keys(msg).map(k => k.split('.')[0]);
                        tabs.value.forEach((tab, i) => {
                            tabs.value[i].is_error = _.intersection(tab.prop, mKeys).length !== 0
                        })
                    }
                }
            });
        }

        const reset = () => {
            resource.value = _.cloneDeep(props.resource);
        }

        expose({submit, reset})

        return () => (
            <el-form ref={formRef} model={resource.value} class="resource-form"
                     label-width='auto'
                     label-position={props.labelPosition}
                     onSubmit={(e => e.preventDefault())}>
                {
                    tabs.value ?
                        <el-tabs v-model={activeTab.value} class="resource-form-tabs">
                            {tabs.value.map((tab, index) =>
                                <el-tab-pane name={index}>
                                    {{
                                        label: () =>
                                            <div
                                                class={["row-center", tabs.value[index].is_error === true ? 'is_error' : '']}>
                                                <span>{tab.name}</span>
                                                {tabs.value[index].is_error === true &&
                                                    <el-icon><WarnTriangleFilled/></el-icon>
                                                }
                                            </div>,
                                        default: () =>
                                            renderFormItems(columns.value.filter(c => tab.prop.includes(c.prop)))
                                    }}
                                </el-tab-pane>
                            )}
                        </el-tabs>
                        :
                        <>{renderFormItems(columns.value)}</>
                }
            </el-form>
        )
    }
})