import {ref, onMounted, defineComponent} from "vue";
import ResourceForm from "../../components/Resources/ResourceForm";
import API from "@/api/index.js";
import {ElMessage} from "element-plus";
import {useRouter} from "vue-router";
import {Check, ArrowLeft} from "@element-plus/icons-vue";
import {useI18n} from 'vue-i18n'
import './ResourceNew.scss';

export default defineComponent({
        name: 'ResourceNew',
        props: {
            resourceConfig: Object,
            newConfig: Object
        },
        emits: [],
        setup(props, {expose}) {
            const {t} = useI18n()
            const router = useRouter();
            const resourceFormRef = ref(null)
            const resource = ref({})

            const loading = ref(false)

            const onSubmit = (resource, resolve) => {
                loading.value = true
                API[props.resourceConfig.resourceData].create(resource).then(response => {
                    router.replace(`/${props.resourceConfig.resourcePath}/show/${response.data.id}`)
                    loading.value = false
                    ElMessage({
                        message: t('resources.success_message'),
                        type: 'success',
                    })
                }).catch(() => {
                    loading.value = false
                    resolve()
                })
            }

            return () => (
                <>
                    <el-main class="resource-new">
                        <el-card shadow="never">
                            {{
                                header: () => <div className="card-header">
                                    <h4>{props.newConfig.title}</h4>
                                </div>,
                                default: () => <ResourceForm ref={resourceFormRef}
                                                             resource={resource.value}
                                                             onSubmit={onSubmit}
                                                             {...props.newConfig}
                                />
                            }}
                        </el-card>
                    </el-main>
                    <el-footer class={"footer"}>
                        <div className="h-100 d-flex align-center justify-between">
                            <el-button icon={ArrowLeft} type="primary" text
                                       onClick={() => router.go(-1)}>{t('resources.back')}</el-button>
                            <el-button loading={loading.value} disabled={loading.value} icon={Check} type="primary"
                                       onClick={() => resourceFormRef.value.submit()}>
                                {t('resources.submit')}
                            </el-button>
                        </div>
                    </el-footer>
                </>)
        }
    }
)