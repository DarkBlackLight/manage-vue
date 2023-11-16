import {ref, defineComponent} from "vue";
import API from "@/api";
import {ElMessage, ElMessageBox} from "element-plus";
import {Delete, Edit, ZoomIn, Search, Refresh, Plus} from "@element-plus/icons-vue";
import {useI18n} from 'vue-i18n'
import ResourceForm from "@/manage-vue/components/Resources/ResourceForm";
import ResourceTable from "@/manage-vue/components/Resources/ResourceTable";
import './ResourceList.scss';

export default defineComponent({
    name: 'ResourceList',
    props: {
        resourceConfig: {
            type: Object,
        },
        listConfig: {
            type: Object,
        }
    },
    emits: ['new', 'show', 'edit'],
    setup(props, {expose, emit}) {
        const {t} = useI18n()

        const activeTab = ref(0);
        const displayFilter = ref(false);

        const formRef = ref(null);
        const tableRef = ref(null);

        const selectedIds = ref([]);

        const queries = ref({});

        const onDelete = (resource) => {
            ElMessageBox.confirm(t('resources.delete_prompt')).then(() => {
                API[props.resourceConfig.resourceData].delete(resource.id).then(response => {
                    tableRef.value.getResourceList();
                    ElMessage({
                        message: t('resources.delete_message'),
                        type: 'success',
                    })
                })
            })
        }

        const getResourceList = () => tableRef.value.getResourceList();


        const onFilterQuery = (values) => {
            queries.value = values;
            tableRef.value.getResourceList();
        }

        const onResetQuery = () => {
            formRef.value.reset();
            formRef.value.submit();
            tableRef.value.getResourceList();
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

        expose({getResourceList, tableRef})

        return () => (
            <>
                <el-main>
                    {
                        props.listConfig.tabOptions &&
                        <el-tabs className="resource-list-tabs" v-model={activeTab.value} onTabChange={onTabChange}>
                            {
                                props.listConfig.tabOptions.map((option, i) => (
                                    <el-tab-pane label={option.label} name={i}/>
                                ))
                            }
                        </el-tabs>
                    }

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

                            {(!props.listConfig.actions || props.listConfig.actions.includes('new')) &&
                                <el-button icon={Plus} type="primary" onClick={() => emit('new')}>
                                    {t('resources.new')}
                                </el-button>
                            }

                            {/*{(!props.listConfig.actions || props.listConfig.actions.includes('delete')) &&*/}
                            {/*    <el-button icon={Delete} plain type="danger" v-show={selectedIds.value.length}*/}
                            {/*               onClick={onDeleteSelected}>{t('resources.delete')}*/}
                            {/*    </el-button>}*/}
                        </div>
                    </div>

                    <ResourceTable
                        ref={tableRef}
                        remote={() => {
                            let all_queries = queries.value;

                            if (props.listConfig.queries)
                                all_queries = {...props.listConfig.queries, ...all_queries};

                            if (props.listConfig.tabProp)
                                all_queries[props.listConfig.tabProp] = props.listConfig.tabOptions[activeTab.value].value;

                            return API[props.resourceConfig.resourceData].all(all_queries)
                        }}
                        preprocess={props.listConfig.preprocess}
                        tableProps={props.listConfig.tableProps}
                        columns={[
                            ...props.listConfig.columns,
                            ...[{
                                label: t('resources.actions'),
                                fixed: 'right',
                                width: 150,
                                render: (r) =>
                                    (r.id && <div>
                                            {props.listConfig.actions.includes('show') &&
                                                <el-button plain type="primary" icon={ZoomIn} circle
                                                           onClick={() => emit('show', r)}/>}

                                            {props.listConfig.actions.includes('edit') &&
                                                <el-button plain type="warning" icon={Edit} circle
                                                           onClick={() => emit('edit', r)}/>}

                                            {props.listConfig.actions.includes('delete') &&
                                                <el-button plain type="danger" icon={Delete} circle
                                                           onClick={() => onDelete(r)}/>}
                                        </div>
                                    )

                            }]
                        ]}/>
                </el-main>
            </>
        )
    }
})