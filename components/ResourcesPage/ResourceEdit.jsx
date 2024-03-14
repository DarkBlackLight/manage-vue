import {ref, onMounted, defineComponent} from "vue";
import ResourceForm from "../../components/Resources/ResourceForm";
import API from "@/api/index.js";
import {ElMessage} from "element-plus";
import {useRoute, useRouter} from "vue-router";
import './ResourceEdit.scss';
import {ArrowLeft, Check} from "@element-plus/icons-vue";
import {useI18n} from 'vue-i18n'

export default defineComponent({
        name: 'ResourceEdit',
        props: {
            resourceConfig: Object,
            editConfig: Object
        },
        emits: [],
        setup(props, {}) {
            const {t} = useI18n()
            const route = useRoute();
            const router = useRouter();
            const resourceFormRef = ref(null)
            const resource = ref()

            const loading = ref(false)

            const loaded = ref(false)

            const onSubmit = (resource, resolve) => {
                loading.value = true
                API[props.resourceConfig.resourceData].update(resource).then(response => {
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

            const getResource = () => {
                loaded.value = false
                API[props.resourceConfig.resourceData].get(route.params.id).then(response => {
                    resource.value = response.data;
                    loaded.value = true
                })
            }

            onMounted(() => {
                getResource()
            })

            return () => resource.value && <>
                <el-main v-loading={!loaded.value} class="resource-edit">
                    {loaded.value && <el-card shadow="never">
                        {{
                            header: () => <div className="card-header">
                                <h4>{props.editConfig.title}</h4>
                            </div>,
                            default: () => <ResourceForm ref={resourceFormRef}
                                                         resource={resource.value}
                                                         columns={props.editConfig.columns}
                                                         onSubmit={onSubmit}
                                                         {...props.editConfig}/>
                        }}
                    </el-card>}
                </el-main>
                <el-footer class={"footer"}>
                    <div class="h-100 d-flex align-center justify-between">
                        <el-button icon={ArrowLeft} type="primary" text
                                   onClick={() => router.go(-1)}>{t('resources.back')}</el-button>
                        <el-button loading={loading.value} disabled={loading.value} icon={Check} type="primary"
                                   onClick={() => resourceFormRef.value.submit()}>
                            {t('resources.submit')}
                        </el-button>
                    </div>
                </el-footer>
            </>
        }
    }
)