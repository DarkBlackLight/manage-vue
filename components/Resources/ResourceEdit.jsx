import {ref, defineComponent} from "vue";
import {ElMessage} from 'element-plus';
import {Check} from "@element-plus/icons-vue";

import API from "@/api";
import ResourceDialog from "./ResourceDialog";
import ResourceForm from "./ResourceForm";
import {useI18n} from 'vue-i18n'

export default defineComponent({
    name: 'ResourceEdit',
    props: {
        resourceConfig: Object,
        editConfig: Object
    },
    emits: ['success'],
    setup(props, {emit, expose}) {
        const {t} = useI18n()

        const resourceDialogRef = ref(null);
        const editResource = ref(null);

        const resourceFormRef = ref(null);

        const onEdit = (resource) => {
            API[props.resourceConfig.resourceData].get(resource.id).then(response => {
                editResource.value = response.data;
                resourceDialogRef.value.onToggle();
            })
        }

        const onSubmit = (resource, resolve) => {
            API[props.resourceConfig.resourceData].update({...{id: editResource.value.id}, ...resource}).then(response => {
                resourceDialogRef.value.onToggle();
                emit('success', response.data, editResource.value);
                ElMessage({
                    message: t('resources.success_message'),
                    type: 'success',
                })
            })
        }

        expose({onEdit})

        return () => (
            <ResourceDialog title={props.editConfig.title} ref={resourceDialogRef} class={props.editConfig.className}>
                {{
                    default: () => (editResource.value && <ResourceForm resource={editResource.value}
                                                                        onSubmit={onSubmit}
                                                                        ref={resourceFormRef}
                                                                        {...props.editConfig}/>),
                    footer: () =>
                        <el-row gutter={20}>
                            <el-col class="text-right">
                                <el-button icon={Check} type="primary"
                                           onClick={() => resourceFormRef.value.submit()}>{t('resources.submit')}
                                </el-button>
                            </el-col>
                        </el-row>
                }}
            </ResourceDialog>
        )
    }
})