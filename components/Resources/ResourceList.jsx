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

        const activeTab = ref(props.listConfig.activeTab ? props.listConfig.activeTab : 0);
        const displayFilter = ref(false);

        const formRef = ref(null);
        const tableRef = ref(null);

        const selectedIds = ref([]);

        const queries = ref({});

        const actions = ref(typeof props.listConfig.actions === 'function' ? props.listConfig.actions() : props.listConfig.actions);

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


        const onFilterQuery = (values, resolve) => {
            queries.value = values;
            tableRef.value.initPagination();
            tableRef.value.getResourceList();
            resolve()
        }

        const onResetQuery = () => {
            formRef.value.reset();
            formRef.value.submit();
            tableRef.value.initPagination();
            tableRef.value.getResourceList();
        }

        const onSearch = () => {
            displayFilter.value = !displayFilter.value;
        }

        const handleSelectionChange = (rows) => {
            selectedIds.value = rows.map(row => row.id)
        }

        const onDeleteSelected = () => {
            ElMessageBox.confirm(t('resources.delete_prompt')).then(() => {
                API[props.resourceConfig.resourceData].delete(selectedIds.value.join(',')).then(response => {
                    tableRef.value.getResourceList();
                    ElMessage({
                        message: t('resources.delete_message'),
                        type: 'success',
                    })
                })
            })
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

        expose({getResourceList, getQueries, tableRef})

        return () => (
            <el-main>
                {
                    props.listConfig.tabOptions &&
                    <el-tabs class="resource-list-tabs" v-model={activeTab.value} onTabChange={onTabChange}>
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
                                                  <div class={"d-flex align-center"}
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

                        {props.listConfig.tools && props.listConfig.tools(selectedIds.value)}

                        {(actions.value.includes('new')) &&
                            <el-button icon={Plus} type="primary" onClick={() => emit('new')}>
                                {t('resources.new')}
                            </el-button>
                        }

                        {(actions.value.includes('delete')) &&
                            <el-button icon={Delete} plain type="danger" v-show={selectedIds.value.length}
                                       onClick={onDeleteSelected}>{t('resources.delete')}
                            </el-button>}
                    </div>
                </div>

                <ResourceTable
                    ref={tableRef}
                    remote={(table_queries) => {
                        let all_queries = getQueries();

                        if (table_queries)
                            all_queries = {...table_queries, ...all_queries};

                        return API[props.resourceConfig.resourceData].all(all_queries)
                    }}
                    preprocess={props.listConfig.preprocess}
                    tableProps={props.listConfig.tableProps}
                    customTable={props.listConfig.customTable}
                    onSelectionChange={handleSelectionChange}
                    columns={[
                        ...props.listConfig.columns,
                        ...[{
                            label: t('resources.actions'),
                            fixed: 'right',
                            width: 150,
                            render: (r) => {
                                if (r.id) {
                                    let btn_actions = typeof props.listConfig.actions === 'function' ? props.listConfig.actions(r) : props.listConfig.actions;
                                    return (<div>
                                            {btn_actions.includes('show') &&
                                                <el-button plain type="primary" icon={ZoomIn} circle
                                                           onClick={() => emit('show', r)}/>}

                                            {btn_actions.includes('edit') &&
                                                <el-button plain type="warning" icon={Edit} circle
                                                           onClick={() => emit('edit', r)}/>}

                                            {btn_actions.includes('delete') &&
                                                <el-button plain type="danger" icon={Delete} circle
                                                           onClick={() => onDelete(r)}/>}
                                        </div>
                                    )
                                }
                            }
                        }]
                    ]}/>
            </el-main>
        )
    }
})