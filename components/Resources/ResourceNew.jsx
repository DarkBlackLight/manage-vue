import {ref, defineComponent} from "vue";
import {ElMessage} from 'element-plus';
import {Check} from "@element-plus/icons-vue";
import API from "@/api";
import ResourceDialog from "./ResourceDialog";
import ResourceForm from "./ResourceForm";
import {useI18n} from 'vue-i18n'

export default defineComponent({
    name: 'ResourceNew',
    props: {
        resourceConfig: Object,
        newConfig: Object
    },
    emits: ['success'],
    setup(props, {emit, expose}) {
        const {t} = useI18n()

        const resource = ref({});
        const resourceDialogRef = ref(null);
        const resourceFormRef = ref(null);

        const onNew = () => {
            resource.value = {};
            resourceDialogRef.value.onToggle();
        }


        const onSubmit = (resource, resolve) => {
            API[props.resourceConfig.resourceData].create(resource).then(response => {
                resourceDialogRef.value.onToggle();
                emit('success', response.data);
                ElMessage({
                    message: t('resources.success_message'),
                    type: 'success',
                })
            }).catch(() => {
                resolve()
            })
        }

        expose({onNew})

        return () => (
            <ResourceDialog title={props.newConfig.title} ref={resourceDialogRef} class={props.newConfig.className} draggable>
                {{
                    default: () => <ResourceForm resource={resource.value}
                                                 onSubmit={onSubmit}
                                                 ref={resourceFormRef}
                                                 {...props.newConfig}/>,
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