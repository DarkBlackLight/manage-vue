import {ref, defineComponent} from "vue";
import {ElMessage} from 'element-plus';
import {Check} from "@element-plus/icons-vue";
import API from "@/api";
import ResourceDialog from "./ResourceDialog";
import ResourceForm from "./ResourceForm";

export default defineComponent({
    name: 'ResourceNew',
    props: {
        resourceConfig: Object,
        newConfig: Object
    },
    emits: ['success'],
    setup(props, {emit, expose}) {
        const resourceDialogRef = ref(null);
        const resourceFormRef = ref(null);

        const onNew = (resource) => {
            resourceDialogRef.value.onToggle();
        }

        const onSubmit = (resource) => {
            API[props.resourceConfig.resourceData].create(resource).then(response => {
                resourceDialogRef.value.onToggle();
                emit('success');
                ElMessage({
                    message: '提交成功!',
                    type: 'success',
                })
            })
        }

        expose({onNew})

        return () => (
            <ResourceDialog title={props.newConfig.title} ref={resourceDialogRef}>
                {{
                    default: () => <ResourceForm onSubmit={onSubmit}
                                                 ref={resourceFormRef}
                                                 tabs={props.newConfig.tabs}
                                                 columns={props.newConfig.columns}/>,
                    footer: () =>
                        <el-row gutter={20}>
                            <el-col class="text-right">
                                <el-button icon={Check} type="primary"
                                           onClick={() => resourceFormRef.value.submit()}>提交
                                </el-button>
                            </el-col>
                        </el-row>
                }}
            </ResourceDialog>
        )
    }
})