import {defineComponent, onMounted, ref, watch} from "vue";
import {Delete, Plus} from "@element-plus/icons-vue";
import ElTableNext from "el-table-next";
import {ElMessageBox} from "element-plus";

import API from "@/api";
import './ResourceForm.scss';

import _ from "lodash-es";

const renderOption = (c, r) => (
    <el-select modelValue={_.get(r, c.prop)} onChange={(e) => _.set(r, c.prop, e)} class="w-100" {...c.props}
               filterable>
        {c.options && c.options.map(option => (
            <el-option key={option.value} label={option.label} value={option.value}/>))}
    </el-select>)

const renderImage = (c, r) => {
    return (<el-upload
        class="resource-form-image"
        show-file-list={false}
        http-request={({file}) => {
            API.Storage.upload(file).then(response => {
                _.set(r, c.prop, response.data.id);
                _.set(r, c.prop.replace('_id', ''), response.data);
            });
        }}
    >
        {_.get(r, c.prop.replace('_id', '')) ? <div class='uploader-image'>
            <el-image src={_.get(r, c.prop.replace('_id', ''))['src']}/>
        </div> : <el-icon class='uploader-icon'><Plus/></el-icon>}
    </el-upload>)
}


const renderColumn = {
    'text': (c, r) => <el-input modelValue={_.get(r, c.prop)} onInput={(e) => _.set(r, c.prop, e)}
                                type="text" {...c.props} />,

    'textarea': (c, r) => <el-input modelValue={_.get(r, c.prop)} onInput={(e) => _.set(r, c.prop, e)}
                                    type="textarea" {...c.props}/>,

    'password': (c, r) => <el-input modelValue={_.get(r, c.prop)} onInput={(e) => _.set(r, c.prop, e)}
                                    type="password" {...c.props} show-password/>,

    'number': (c, r) => <el-input-number modelValue={_.get(r, c.prop)} onChange={(e) => _.set(r, c.prop, e)}
                                         {...c.props} />,

    'date': (c, r) => <el-date-picker modelValue={_.get(r, c.prop)} onUpdate:modelValue={(e) => _.set(r, c.prop, e)}
                                      type="date" {...c.props}/>,

    'datetime': (c, r) => <el-date-picker modelValue={_.get(r, c.prop)} onUpdate:modelValue={(e) => _.set(r, c.prop, e)}
                                          type="datetime" {...c.props}/>,

    'time': (c, r) => <el-time-picker modelValue={_.get(r, c.prop)} onUpdate:modelValue={(e) => {
        _.set(r, c.prop, e)
    }}
                                      arrow-control {...c.props}/>,
    'options': renderOption,
    'remote_options': renderOption,
    'image': renderImage,
    'display': (c, r) => c.render ? c.render(c, r) : <el-text class="mx-6">{_.get(r, c.prop)}</el-text>,
    'color': (c, r) => <el-color-picker modelValue={_.get(r, c.prop)}
                                        onUpdate:modelValue={(e) => _.set(r, c.prop, e)} {...c.props}></el-color-picker>,
    'slider': (c, r) => <el-slider modelValue={_.get(r, c.prop)}
                                   onUpdate:modelValue={(e) => _.set(r, c.prop, e)} {...c.props}></el-slider>,
    'switch': (c, r) => <el-switch modelValue={_.get(r, c.prop)}
                                   onUpdate:modelValue={(e) => _.set(r, c.prop, e)} {...c.props}></el-switch>
}

const setColumnDefault = (c, r) => {
    _.set(r, c.prop, c.default ? c.default : initResource[c.type](c))
}

const renderAssociations = (column, resource) => (<el-col span={24}>
    <ElTableNext data={_.get(resource, column.prop).filter(r => r['_destroy'] !== true)} column={[...[{

        label: '操作',
        render: (value, scope) => <el-button icon={Delete} circle plain type='danger' onClick={() => {
            ElMessageBox.confirm('确定要删除该资源吗?').then(() => {
                _.get(resource, column.prop)[value.$index]['_destroy'] = true
            })
        }}/>
    }], ...column.columns.map(c => ({
        prop: c.prop, label: c.label, ...c.props, render: (value, scope) => renderColumn[c.type](c, scope.row)
    }))]

    } border/>
    <div class="text-start my-10">
        <el-button plain icon={Plus} type="primary" onClick={() => {
            let newResource = {};
            column.columns.forEach(c => setColumnDefault(c, newResource))
            _.get(resource, column.prop).push(newResource);
        }}>添加
        </el-button>
    </div>
</el-col>)

const renderAssociation = (column, resource) => renderColumns(column.columns, _.get(resource, column.prop))

const renderColumns = (columns, resource) => columns.map((column) => {
    if (!column.condition || column.condition(resource)) {
        if (column.type === 'associations')
            return (renderAssociations(column, resource))
        else if (column.type === 'association')
            return (renderAssociation(column, resource))
        else if (column.type === 'hidden')
            return null
        else return (
                <el-col span={column.span ? column.span : 18}>
                    <el-form-item label={column.label} prop={column.prop.split(',')}>
                        {renderColumn[column.type](column, resource)}
                    </el-form-item>
                </el-col>)
    }
})

const initResource = {
    'text': (c) => null,
    'textarea': (c) => null,
    'password': (c) => null,
    'number': (c) => null,
    'date': (c) => null,
    'datetime': (c) => null,
    'time': (c) => null,
    'options': (c) => c && c.props && c.props.multiple ? [] : null,
    'remote_options': (c) => c && c.props && c.props.multiple ? [] : null,
    'image': (c) => null,
    'display': (c) => null,
    'association': (c) => ({}),
    'associations': (c) => [],
    'hidden': (c) => null,
    'color': (c) => null,
    'slider': (c) => null,
    'switch': (c) => null
}


export default defineComponent({
    name: 'ResourceForm', props: {
        resource: Object, columns: Array, tabs: Array
    }, emits: ['submit', 'change'], setup(props, {expose, emit}) {
        const formRef = ref(null);
        const activeTab = ref(0);

        const columns = ref(props.columns);
        const resource = ref(props.resource ? props.resource : {});

        const rules = ref([]);

        const initColumn = (column) => {
            if (!column.type) column.type = 'text';

            if (!column.props) column.props = {}

            // Init Default Value
            if (!props.resource) setColumnDefault(column, resource.value);

            if (column.type === 'remote_options') {
                column.options = []
                column.props.loading = true
                column.remote_options.remote().then(data => {
                    column.options = data.map(d => ({
                        value: d[column.remote_options.value], label: d[column.remote_options.label]
                    }))
                    column.props.loading = false
                })
            } else if (column.type === 'associations') {
                column.columns.forEach(c => initColumn(c));
            } else if (column.type === 'association') {
                column.columns.forEach(c => initColumn(c));
            }
        }


        const prepareColumn = (cs, r) => {
            let result = {};

            if (r.id) result.id = r.id

            if (r['_destroy']) result['_destroy'] = r['_destroy']

            cs.forEach(c => {
                if (!c.condition || c.condition(_.get(r, c.prop))) {
                    if (c.type === 'associations')
                        result[`${c.prop}_attributes`] = _.get(r, c.prop).map(d => prepareColumn(c.columns, d))
                    else if (c.type === 'association')
                        result[`${c.prop}_attributes`] = prepareColumn(c.columns, _.get(r, c.prop))
                    else if (c.type !== 'display' && c.type !== 'hidden')
                        result[c.prop] = _.get(r, c.prop)
                }
            })

            return result
        }

        const submit = () => {
            formRef.value.validate((valid) => {
                if (valid) {
                    emit('submit', prepareColumn(columns.value, resource.value));
                }
            })
        }

        watch(resource, (newResource) => {
            emit('change', newResource)
        }, {deep: true})

        expose({submit})

        onMounted(() => {
            columns.value.forEach((column) => initColumn(column));

            columns.value
                .filter(column => column.rules)
                .forEach(column => rules.value[column.prop] = column.rules)
        })

        return () => (
            <el-form rules={rules} ref={formRef} model={resource.value} label-width='auto' label-position="right">
                {props.tabs ? <el-tabs v-model={activeTab.value} class="resource-form-tabs">
                    {props.tabs.map((tab, index) => <el-tab-pane label={tab.name} name={index}>
                        <el-row gutter={20}>
                            {renderColumns(columns.value.filter(column => tab.prop.includes(column.prop)), resource.value)}
                        </el-row>
                    </el-tab-pane>)}
                </el-tabs> : <el-row gutter={20} style={{padding: '15px 0'}}>
                    {renderColumns(columns.value, resource.value)}
                </el-row>}
            </el-form>)
    }
})