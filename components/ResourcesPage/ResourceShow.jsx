import {ref, defineComponent, onMounted} from "vue";
import API from "@/api";
import {formatDateTime} from "@/manage-vue/config/tools.js"
import {useRoute, useRouter} from "vue-router";
import './ResourceShow.scss';
import _ from 'lodash-es';
import {useI18n} from 'vue-i18n'
import {ArrowLeft, Edit, Delete} from "@element-plus/icons-vue";
import {ElMessage, ElMessageBox} from "element-plus";

const renderColumns = (columns, showResource) => columns.map(column =>
    (<el-descriptions-item label={column.label} span={column.span} label-class-name={"label-class-name"}>
        {() => {
            if (column.render)
                return column.render(showResource)
            else if (column.type === 'datetime')
                return formatDateTime(_.get(showResource, column.prop))
            else if (column.type === 'image')
                return (
                    _.get(showResource, column.prop) &&
                    <el-image style="height: 30px" src={_.get(showResource, column.prop).src}
                              preview-src-list={[_.get(showResource, column.prop).src]}
                    />
                )
            else if (column.type === 'file')
                return (
                    _.get(showResource, column.prop) &&
                    <el-link href={_.get(showResource, column.prop.replace('_id', ''))['src']}
                             target="_blank">{_.get(showResource, column.prop.replace('_id', ''))['filename']}</el-link>
                )
            else
                return _.get(showResource, column.prop)
        }}
    </el-descriptions-item>)
)

export default defineComponent({
    name: 'ResourceShow',
    props: {
        resourceConfig: Object,
        showConfig: Object
    },
    setup(props, {expose, slots}) {
        const {t} = useI18n()
        const route = useRoute();
        const router = useRouter();

        const showResource = ref(null);

        const onDelete = () => {
            ElMessageBox.confirm(t('resources.delete_prompt')).then(() => {
                API[props.resourceConfig.resourceData].delete(showResource.value.id).then(response => {
                    router.go(-1)
                    ElMessage({
                        message: t('resources.delete_message'),
                        type: 'success',
                    })
                })
            })
        }

        onMounted(() => {
            API[props.resourceConfig.resourceData].get(route.params.id).then(response => {
                showResource.value = response.data;
            })
        })

        return () => (
            <>
                <el-main class="resource-show">
                    <el-card shadow="never">
                        {{
                            header: () => <div class="card-header">
                                <h4>{props.showConfig.title}</h4>
                            </div>,
                            default: () => <el-descriptions column={props.showConfig.columnsNumber} border>
                                {showResource && renderColumns(props.showConfig.columns, showResource.value)}
                            </el-descriptions>
                        }}
                    </el-card>
                </el-main>
                <el-footer class={"footer"}>
                    <div class="h-100 d-flex align-center justify-between">
                        <el-button icon={ArrowLeft} type="primary" text
                                   onClick={() => router.go(-1)}>{t('resources.back')}</el-button>
                        <div>
                            {(!props.showConfig.actions || props.showConfig.actions.includes('edit')) &&
                                <el-button icon={Edit} type="warning"
                                           onClick={() => {
                                               router.push({
                                                   path: `/${props.resourceConfig.resourcePath}/edit/${route.params.id}`
                                               })
                                           }}>
                                    {t('resources.edit')}
                                </el-button>
                            }
                            {(!props.showConfig.actions || props.showConfig.actions.includes('delete')) &&
                                <el-button icon={Delete} type="danger"
                                           onClick={onDelete}>
                                    {t('resources.delete')}
                                </el-button>
                            }
                        </div>
                    </div>
                </el-footer>
            </>
        )
    }
})