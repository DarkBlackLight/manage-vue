import {ref, defineComponent, onMounted, markRaw} from "vue";
import API from "@/api";
import {formatDateTime, formatDate} from "@/manage-vue/config/tools.js"
import {useRoute, useRouter} from "vue-router";
import './ResourceShow.scss';
import _ from 'lodash-es';
import {useI18n} from 'vue-i18n'
import {ArrowLeft, Edit, Delete} from "@element-plus/icons-vue";
import {ElMessage, ElMessageBox} from "element-plus";

const renderCard = (column, showResource) => {
    return (
        <el-card shadow="never">
            {{
                header: () => <div class="card-header">
                    <h4>{column.title}</h4>
                </div>,
                default: () => <el-descriptions column={column.columnsNumber} border>
                    {showResource && renderColumns(column.columns, showResource)}
                </el-descriptions>
            }}
        </el-card>
    )
}

const renderColumns = (columns, showResource) => columns.map(column =>
    (<el-descriptions-item label={column.label} span={column.span} label-class-name={"label-class-name"}>
        {() => {
            if (column.render)
                return column.render(showResource)
            else if (column.type === 'datetime')
                return formatDateTime(_.get(showResource, column.prop))
            else if (column.type === 'date')
                return formatDate(_.get(showResource, column.prop))
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
        showConfig: Object,
        resourceData: Object
    },
    setup(props, {expose, slots}) {
        const {t} = useI18n()
        const route = useRoute();
        const router = useRouter();

        const showResource = ref(null);

        const loading = ref(true)

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

        const updateShowResource = (resource) => {
            showResource.value = resource;
        }

        onMounted(() => {
            loading.value = true
            if (props.resourceData) {
                showResource.value = _.cloneDeep(props.resourceData)
                loading.value = false
            } else {
                API[props.resourceConfig.resourceData].get(route.params.id).then(response => {
                    if (props.showConfig.preprocess) {
                        showResource.value = props.showConfig.preprocess(response.data)
                    } else {
                        showResource.value = response.data;
                    }
                    loading.value = false
                })
            }
        })

        expose({updateShowResource})

        return () => (
            <>
                <el-main v-loading={loading.value} class="resource-show">
                    <el-row gutter={props.showConfig.gutter ? props.showConfig.gutter : 20}>
                        {props.showConfig.columnConfig.map(column => <el-col span={column.span ? column.span : 24}>
                            {!loading.value && renderCard(column, showResource.value)}
                        </el-col>)}
                    </el-row>
                </el-main>
                <el-footer class={"footer"}>
                    <div class="h-100 d-flex align-center justify-between">
                        <el-button icon={ArrowLeft} type="primary" text
                                   onClick={() => router.go(-1)}>{t('resources.back')}</el-button>
                        <div>
                            {(!props.showConfig.actions || props.showConfig.actions.includes('edit')) &&
                                <el-button plain icon={Edit} type="warning"
                                           onClick={() => {
                                               router.push({
                                                   path: `/${props.resourceConfig.resourcePath}/edit/${route.params.id}`
                                               })
                                           }}>
                                    {t('resources.edit')}
                                </el-button>
                            }
                            {(!props.showConfig.actions || props.showConfig.actions.includes('delete')) &&
                                <el-button plain icon={Delete} type="danger"
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