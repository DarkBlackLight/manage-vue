import {ref, defineComponent, nextTick, onMounted} from "vue";
import API from "@/api/index.js";
import {ElMessage, ElMessageBox} from "element-plus";
import {Delete, Edit, ZoomIn, Search, Refresh, Plus} from "@element-plus/icons-vue";
import {useI18n} from 'vue-i18n'
import {useRouter} from "vue-router";
import ResourceForm from "../Resources/ResourceForm";
import ResourceTable from "../ResourcesPage/ResourceTable";
import './ResourceList.scss';


const paginate = (data, pageSize, currentPage) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
}

export default defineComponent({
    name: 'ResourceList',
    props: {
        resourceConfig: {
            type: Object,
        },
        listConfig: {
            type: Object,
        },
        tableData: {
            type: Array
        },
    },
    emits: ['new', 'show', 'edit'],
    setup(props, {expose, emit}) {
        const router = useRouter()
        const {t} = useI18n()

        const activeTab = ref(props.listConfig.activeTab ? props.listConfig.activeTab : 0);
        const displayFilter = ref(false);

        const formRef = ref(null);
        const tableRef = ref(null);

        const selectedIds = ref([]);

        const queries = ref({});

        const loading = ref(true);


        const pageSize = ref(props.listConfig.page_size ? props.listConfig.page_size : 10);
        const currentPage = ref(props.listConfig.current_page ? props.listConfig.current_page : 1);

        const resources = ref([]);
        const resourcesTotal = ref(0);

        const onDelete = (resource) => {
            ElMessageBox.confirm(t('resources.delete_prompt')).then(() => {
                API[props.resourceConfig.resourceData].delete(resource.id).then(response => {
                    getResourceList();
                    ElMessage({
                        message: t('resources.delete_message'),
                        type: 'success',
                    })
                })
            })
        }

        const initPagination = () => {
            currentPage.value = props.listConfig.current_page ? props.listConfig.current_page : 1
            pageSize.value = props.listConfig.page_size ? props.listConfig.page_size : 10
        }

        const getResourceList = () => {
            loading.value = true;
            if (props.tableData) {
                resources.value = paginate(props.tableData, pageSize.value, currentPage.value);
                resourcesTotal.value = props.tableData.length;
                loading.value = false;
            } else {

                let all_queries = getQueries();

                all_queries = {page_size: pageSize.value, page: currentPage.value, ...all_queries};

                API[props.resourceConfig.resourceData].all(all_queries).then(async response => {
                    if (props.listConfig.preprocess) {
                        response = props.listConfig.preprocess(response);
                    }

                    resources.value = response.data;
                    resourcesTotal.value = response.total;

                    loading.value = false;
                })
            }
        }

        const onFilterQuery = (values, resolve) => {
            queries.value = values;
            initPagination();
            getResourceList();
            resolve()
        }

        const onResetQuery = () => {
            formRef.value.reset();
            initPagination();
            formRef.value.submit();
            // getResourceList();
        }

        const onSearch = () => {
            displayFilter.value = !displayFilter.value;
        }

        const handleSelectionChange = (rows) => {
            selectedIds.value = rows.map(row => row.id)
        }

        const onDeleteSelected = () => {
        }

        const onTabChange = () => {
            getResourceList()
        }

        const getQueries = () => {
            let all_queries = {};

            if (props.listConfig.queries)
                all_queries = {...all_queries, ...props.listConfig.queries};

            if (props.listConfig.tabProp)
                all_queries[props.listConfig.tabProp] = props.listConfig.tabOptions[activeTab.value].value;

            all_queries = {...all_queries, ...queries.value};

            return all_queries
        }

        onMounted(() => {
            getResourceList();
        });

        expose({getResourceList, getQueries, tableRef})

        return () => (
            <>
                <el-main v-loading={loading.value}>
                    {props.listConfig.tabOptions &&
                        <el-tabs className="resource-list-tabs" v-model={activeTab.value} onTabChange={onTabChange}>
                            {
                                props.listConfig.tabOptions.map((option, i) => (
                                    <el-tab-pane label={option.label} name={i}/>
                                ))
                            }
                        </el-tabs>}

                    <div v-show={displayFilter.value}>
                        <h3 class="mb-20">搜索</h3>

                        <ResourceForm ref={formRef} resource={{}}
                                      labelPosition="left"
                                      onSubmit={onFilterQuery}
                                      columns={[
                                          ...props.listConfig.filters,
                                          ...[{
                                              prop: 'actions',
                                              type: 'display',
                                              render: () => (
                                                  <el-col span={8}>
                                                      <div className={"d-flex align-center"}
                                                           style={"margin:0 0 18px 50px;"}>
                                                          <el-button type="primary"
                                                                     onClick={() => formRef.value.submit()}
                                                                     icon={Search}>
                                                              {t('resources.search')}
                                                          </el-button>
                                                          <el-button onClick={onResetQuery}
                                                                     icon={Refresh}>
                                                              {t('resources.reset')}
                                                          </el-button>
                                                      </div>
                                                  </el-col>
                                              )
                                          }]
                                      ]}/>

                        <el-divider/>

                    </div>

                    <div class="row-justify-space-between mb-10">
                        <h3>{props.listConfig.title}</h3>

                        <div>
                            <el-button icon={Refresh} circle onClick={() => getResourceList()}/>

                            {props.listConfig.filters && props.listConfig.filters.length > 0 &&
                                <el-button icon={Search} circle type={displayFilter.value ? 'primary' : 'default'}
                                           onClick={onSearch}/>
                            }

                            {props.listConfig.tools && props.listConfig.tools()}

                            {(!props.listConfig.actions || props.listConfig.actions.includes('new')) &&
                                <el-button icon={Plus} type="primary" onClick={() => {
                                    emit('new')
                                    router.push({
                                        path: `/${props.resourceConfig.resourcePath}/new`
                                    })
                                }
                                }>
                                    {t('resources.new')}
                                </el-button>
                            }

                            {/*{(!props.listConfig.actions || props.listConfig.actions.includes('delete')) &&*/}
                            {/*    <el-button icon={Delete} plain type="danger" v-show={selectedIds.value.length}*/}
                            {/*               onClick={onDeleteSelected}>{t('resources.delete')}*/}
                            {/*    </el-button>}*/}
                        </div>
                    </div>

                    {!loading.value && <ResourceTable
                        ref={tableRef}
                        data={resources.value}
                        tableProps={props.listConfig.tableProps}
                        customTable={props.listConfig.customTable}
                        enableSelection={props.listConfig.enableSelection}
                        filterRowSelections={props.listConfig.filterRowSelections}
                        enablePagination={false}
                        columns={[
                            ...props.listConfig.columns,
                            ...[{
                                label: t('resources.actions'),
                                fixed: 'right',
                                width: 150,
                                render: (r) =>
                                    (r.id && <div>
                                            {(!props.listConfig.actions || props.listConfig.actions.includes('show')) &&
                                                <el-button plain type="primary" icon={ZoomIn} circle
                                                           onClick={
                                                               () => {
                                                                   emit('show', r)
                                                                   router.push({
                                                                       path: `/${props.resourceConfig.resourcePath}/show/${r.id}`
                                                                   })
                                                               }
                                                           }/>}

                                            {(!props.listConfig.actions || props.listConfig.actions.includes('edit')) &&
                                                <el-button plain type="warning" icon={Edit} circle
                                                           onClick={() => {
                                                               emit('edit', r)
                                                               router.push({
                                                                   path: `/${props.resourceConfig.resourcePath}/edit/${r.id}`
                                                               })
                                                           }}/>}

                                            {(!props.listConfig.actions || props.listConfig.actions.includes('delete')) &&
                                                <el-button plain type="danger" icon={Delete} circle
                                                           onClick={() => onDelete(r)}/>}
                                        </div>
                                    )

                            }]
                        ]}/>}
                </el-main>
                <el-footer class={"footer"}>
                    <div class={"h-100 row-center"}>
                        <el-pagination v-model:pageSize={pageSize.value}
                                       v-model:currentPage={currentPage.value}
                                       pageSizes={[10, 50, 100]}
                                       total={resourcesTotal.value}
                                       layout="total,sizes, prev, pager, next, jumper"
                                       onSizeChange={() => getResourceList()}
                                       onCurrentChange={() => getResourceList()}
                        />
                    </div>
                </el-footer>
            </>
        )
    }
})