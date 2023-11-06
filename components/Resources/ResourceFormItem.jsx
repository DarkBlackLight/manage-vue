import _ from "lodash-es";
import API from "@/api";
import {Delete, Plus, Rank} from "@element-plus/icons-vue";
import {ElMessageBox} from "element-plus";
import ElTableNext from "el-table-next";
import {defineComponent, onMounted, ref, nextTick} from "vue";
import Sortable from 'sortablejs';

// const renderDragAssociations = (t, column, resource) => {
//     return (
//         <el-col span={24}>
//             <div id={column.prop + "_drag_associations"} class={"resource-drag-associations"}
//                  data-prop={column.prop}>
//                 {_.get(resource, column.prop).filter(r => !('_destroy' in r) || r['_destroy'] != true).length > 0 ? _.get(resource, column.prop).filter(r => !('_destroy' in r) || r['_destroy'] != true).map((item, index) => (
//                     <div class={'d-flex align-center resource-drag-associations-item'}>
//                         {_.get(resource, column.prop).filter(r => !('_destroy' in r) || r['_destroy'] != true).length > 1 &&
//                             <el-icon size={16} class={"drag_handle icon-drag mr-20"}>
//                                 <Rank/>
//                             </el-icon>}
//                         {column.columns.filter(c => c.type === 'image').map(c => (
//                             (!c.condition || c.condition(resource)) &&
//                             <el-form-item class={"mr-20"} prop={[column.prop, index, c.prop]}>
//                                 {column.prop + index + c.prop}
//                                 <div className={""}>{c.label}</div>
//                                 {renderColumn[c.type](c, item)}
//                             </el-form-item>
//                         ))}
//                         <el-row gutter={20}>
//                             {column.columns.filter(c => c.type != 'image' && c.type != 'hidden').map(c => (!c.condition || c.condition(resource)) && (
//                                 <el-col span={c.span ? c.span : 18}>
//                                     <el-form-item rules={c.rules} prop={[column.prop, index, c.prop]}>
//                                         <div className={""}>{c.label}</div>
//                                         {renderColumn[c.type](c, item)}
//                                     </el-form-item>
//                                 </el-col>
//                             ))}
//                         </el-row>
//                         <el-button circle class={'ml-20'} plain icon={Delete} type="danger" onClick={() => {
//                             ElMessageBox.confirm(t('resources.delete_prompt')).then(() => {
//                                 _.set(item, '_destroy', true)
//                             })
//                         }}/>
//                     </div>
//                 )) : <div class={"row-center"} style="height:80px;">{t('resources.no_data')}</div>
//                 }
//             </div>
//             {_.get(resource, column.prop).filter(r => !('_destroy' in r) || r['_destroy'] != true).length < column.props.max(resource) &&
//                 <div className="text-start my-10">
//                     <el-button plain icon={Plus} type="primary" onClick={() => {
//                         let newResource = {};
//                         column.columns.forEach(c => setColumnDefault(c, newResource))
//                         _.get(resource, column.prop).push(newResource);
//                     }}>{t('resources.add')}
//                     </el-button>
//                 </div>}
//         </el-col>
//     )
// }

//
// const renderColumns = (t, columns, resource) => columns.map((column) => {
//     if (!column.condition || column.condition(resource)) {
//         if (column.type === 'associations')
//             return (renderAssociations(t, column, resource))
//         else if (column.type === 'association')
//             return (renderAssociation(t, column, resource))
//         else if (column.type === 'drag_associations')
//             return (renderDragAssociations(t, column, resource))
//         else if (column.type === 'hidden')
//             return null
//         else return (
//                 <el-col span={column.span ? column.span : 18}>
//                     <el-form-item label={column.label} prop={column.prop.split(',')}>
//                         {renderColumn[column.type](column, resource)}
//                         {column.type != 'display' && column.render && column.render(resource)}
//                     </el-form-item>
//                 </el-col>)
//     }
// })

const fetchRemoteOptions = (props, states, q) => {
    if (props.remote_options.remote) {
        states.loading = true;
        props.remote_options.remote(q).then(response => {
            states.options = response.map(i => ({
                label: i[props.remote_options.label],
                value: i[props.remote_options.value]
            }));

            states.loading = false;
        })
    }
}

const fetchRemoteCascader = (props, states) => {
    const filterOptions = (parent_id, options) => options.filter(o => o.parent_id === parent_id)
        .map(o => ({...o, ...{children: filterOptions(o.id, options)}}))

    if (props.remote_cascader_options.remote) {
        props.remote_cascader_options.remote().then(response => {
            states.options = filterOptions(null, response.map(i => ({
                id: i['id'],
                parent_id: i['parent_id'],
                label: i[props.remote_cascader_options.label],
                value: i[props.remote_cascader_options.value]
            })));
        })
    }
}

const initItem = {
    'text': (p) => null,
    'textarea': (p) => null,
    'password': (p) => null,
    'number': (p) => null,
    'date': (p) => null,
    'datetime': (p) => null,
    'time': (p) => null,
    'image': (p) => null,
    'file': (p) => null,
    'display': (p) => null,
    'association': (p) => ({}),
    'associations': (p) => [],
    'hidden': (p) => null,
    'color': (p) => null,
    'slider': (p) => null,
    'switch': (p) => null,
    'radio_group': (p) => null,
    'drag_images': (p) => [],
    'drag_associations': (p) => [],
    'options': (p) => p.props && p.props.multiple ? [] : null,
    'remote_options': (p) => p.props && p.props.multiple ? [] : null,
    'remote_cascader': (p) => p.props && p.props.multiple ? [] : null,
}
const renderItem = (props, states, onChange) => {
    let r = props.resource
    let t = props.type;
    let p = props.path;

    if (t === 'display')
        return (<el-text class="mx-6">{_.get(r, p)}</el-text>)
    if (t === 'text')
        return (<el-input modelValue={_.get(r, p)}
                          onInput={(e) => onChange(p, e)}
                          type="text"
                          {...props.props} />)
    else if (t === 'textarea')
        return (<el-input modelValue={_.get(r, p)}
                          onInput={(e) => onChange(p, e)}
                          type="textarea"
                          {...props.props} />)
    else if (t === 'password')
        return (<el-input modelValue={_.get(r, p)} onInput={(e) => onChange(p, e)}
                          type="password"
                          {...props.props}
                          show-password/>)
    else if (t === 'number')
        return (<el-input-number modelValue={_.get(r, p)}
                                 onChange={(e) => onChange(p, e)}
                                 {...props.props} />)
    else if (t === 'time')
        return (<el-time-picker modelValue={_.get(r, p)}
                                onUpdate:modelValue={(e) => onChange(p, e)}
                                arrow-control
                                {...props.props} />)
    else if (t === 'date')
        return (<el-date-picker modelValue={_.get(r, p)}
                                onUpdate:modelValue={(e) => onChange(p, e)}
                                type="date"
                                class="w-100"
                                {...props.props}/>)
    else if (t === 'datetime')
        return (<el-date-picker modelValue={_.get(r, p)}
                                onUpdate:modelValue={(e) => onChange(p, e)}
                                type="datetime"
                                {...props.props}/>)
    else if (t === 'color')
        return (<el-color-picker modelValue={_.get(r, p)}
                                 onUpdate:modelValue={(e) => onChange(p, e)}
                                 {...props.props}/>)
    else if (t === 'slider')
        return (<el-slider modelValue={_.get(r, p)}
                           onUpdate:modelValue={(e) => onChange(p, e)}
                           {...props.props}/>)
    else if (t === 'switch')
        return (<el-switch modelValue={_.get(r, p)}
                           onUpdate:modelValue={(e) => onChange(p, e)}
                           {...props.props}/>)
    else if (t === 'image') {
        let storage_path = p.toSpliced(p.length - 1, 1, p[p.length - 1].replace('_id', ''));
        return (<el-upload
            className="resource-form-image"
            show-file-list={false}
            http-request={({file}) => {
                API.Storage.upload(file).then(response => {
                    onChange(p, response.data.id);
                    onChange(storage_path, response.data);
                });
            }}
        >
            {
                _.get(r, storage_path) ?
                    <div className='uploader-image'>
                        <el-image src={_.get(r, storage_path)['src']}/>
                    </div>
                    :
                    <el-icon className='uploader-icon'><Plus/></el-icon>
            }
        </el-upload>)
    } else if (t === 'file')
        return (<el-upload
            className="resource-form-file"
            show-file-list={false}
            http-request={({file}) => {
                API.Storage.upload(file).then(response => {
                    _.set(r, c.prop, response.data.id);
                    _.set(r, c.prop.replace('_id', ''), response.data);
                });
            }}
        >
            {_.get(r, c.prop.replace('_id', '')) ?
                <el-text>{_.get(r, c.prop.replace('_id', ''))['filename']}</el-text>
                : <el-icon className='uploader-icon'><Plus/></el-icon>}
        </el-upload>)
    else if (t === 'radio_group')
        return (
            <el-radio-group modelValue={_.get(r, p)}
                            onChange={(e) => onChange(p, e)}
                            {...props.props}>
                {states.options.map(option => (
                    <el-radio label={option.value}>{option.label}</el-radio>)
                )}
            </el-radio-group>
        )
    else if (t === 'options')
        return (
            <el-select modelValue={_.get(r, p)}
                       onChange={(e) => onChange(p, e)}
                       class="w-100"
                       {...props.props}>
                {states.options.map(option =>
                    (<el-option key={option.value} label={option.label} value={option.value}/>)
                )}
            </el-select>
        )
    else if (t === 'remote_options')
        return (
            <el-select modelValue={_.get(r, p)}
                       onChange={(e) => onChange(p, e)}
                       class="w-100"
                       filterable
                       remote={true}
                       loading={states.loading}
                       remoteMethod={(q) => fetchRemoteOptions(props, states, q)}
                       {...props.props}>
                {states.options.map(option =>
                    (<el-option key={option.value} label={option.label} value={option.value}/>)
                )}
            </el-select>
        )
    else if (t === 'remote_cascader')
        return (
            <el-cascader modelValue={_.get(r, p)}
                         class="w-100"
                         onChange={(e) => onChange(p, e)}
                         options={states.options}
                         props={
                             {
                                 ...{emitPath: false},
                                 ...props.props
                             }
                         }/>
        )
    else if (t === 'drag_images')
        return (
            <div id={p.join('_') + "_drag_images"} className={"resource-form-drag-images flex-warp"}
                 data-prop={props.props}>
                {_.get(r, p)
                    .filter(i => !('_destroy' in i) || i['_destroy'] !== true)
                    .toSorted((a, b) => a.index < b.index ? 1 : -1)
                    .map(item => (
                        <div className="resource-form-drag-images-item">
                            <el-image src={item.image.src} fit="fill"></el-image>
                            <div className="resource-form-drag-images-item-mask">
                                <el-icon class={"flex-1 icon-drag"}>
                                    <Rank/>
                                </el-icon>
                                <div className={'line'}></div>
                                <div className={"flex-1 h-100 icon-del row-center"} onClick={
                                    () => {
                                        ElMessageBox.confirm('确定删除该图片吗？', '提示', {
                                            confirmButtonText: '确定',
                                            cancelButtonText: '取消',
                                            type: 'warning'
                                        }).then(() => {
                                            onChange(
                                                p,
                                                _.get(r, p).map(n =>
                                                    ({
                                                        ...n,
                                                        ...{'_destroy': item.id === n.id ? true : item['_destroy']}
                                                    })
                                                )
                                            )
                                        })
                                    }
                                }>
                                    <el-icon><Delete/></el-icon>
                                </div>
                            </div>
                        </div>
                    ))}

                <el-upload class="resource-form-image"
                           show-file-list={false}
                           http-request={({file}) => {
                               API.Storage.upload(file).then(response => {
                                   onChange(
                                       p,
                                       [
                                           ..._.get(r, p),
                                           ...[{
                                               index: _.get(r, p).length,
                                               image_id: response.data.id,
                                               image: response.data
                                           }]
                                       ]
                                   )
                               })
                           }}
                           multiple>
                    <el-icon className='uploader-icon'><Plus/></el-icon>
                </el-upload>
            </div>
        )
}

const renderAssociation = (props, states, onChange) => {
    return (<>
        {props.columns.map(c =>
            <ResourceFormItem
                resource={props.resource}
                path={[...props.path, ...[c.prop]]}
                onChange={onChange}
                onChangeSubmit={onChange}
                {...c}/>
        )}
    </>)
}

const renderAssociations = (props, states, onChange) => {
    return (
        <>
            {_.get(props.resource, props.path)
                .map((item, i) =>
                    (!('_destroy' in item) || item['_destroy'] !== true) ?
                        <el-col span={24}>
                            <el-row gutter={20}>
                                <el-col span={20}>
                                    <el-row gutter={20}>
                                        {props.columns.map(c =>
                                            <ResourceFormItem
                                                resource={props.resource}
                                                path={[...props.path, ...[i, c.prop]]}
                                                onChange={onChange}
                                                onChangeSubmit={onChange}
                                                {...c}/>
                                        )}
                                    </el-row>
                                </el-col>
                                <el-col span={4}>
                                    <div class="w-100 h-100 row-center">
                                        <el-button circle plain type="danger" icon={Delete}
                                                   onClick={() => onChange(props.path, _.get(props.resource, props.path).map((item, i1) => i === i1 ? ({...item, ...{"_destroy": true}}) : item))}/>
                                    </div>
                                </el-col>
                            </el-row>
                            <el-divider/>
                        </el-col> : <el-col span={0}></el-col>
                )}
            <el-col span={24}>
                <el-button type="primary" class="w-100" plain onClick={() => {
                    onChange(props.path, [..._.get(props.resource, props.path), ...[{}]])
                }}>新增
                </el-button>
            </el-col>
        </>
    )
}

export default defineComponent({
    name: 'ResourceFormItem',
    props: {
        resource: {
            type: Object,
        },
        path: {
            type: Array,
        },
        prop: {
            type: String,
            required: true
        },
        label: {
            type: String,
        },
        type: {
            type: String,
            default: 'text'
        },
        span: {
            type: Number,
            default: 16
        },
        props: {
            type: Object,
            default: {}
        },
        rules: {
            type: Array,
            default: []
        },
        tips: {
            type: String
        },
        options: {
            type: Array,
            default: []
        },
        remote_options: {
            type: Object,
            default: {}
        },
        remote_cascader_options: {
            type: Object,
            default: {}
        },
        condition: {
            type: Function || Boolean,
        },
        columns: null,
        default: null,
        render: null
    },
    emits: ['change', 'changeSubmit'],
    setup(props, {expose, emit}) {
        const states = ref(null);
        const initialize = () => {
            states.value = {
                options: props.options,
                loading: false
            }

            if (_.get(props.resource, props.path)) {
                onChange(props.path, _.get(props.resource, props.path))
            } else {
                if (props.default)
                    onChange(props.path, props.default)
                else {
                    onChange(props.path, initItem[props.type](props))
                }
            }

            if (props.type === 'remote_options') {
                fetchRemoteOptions(props, states.value, '');
            } else if (props.type === 'remote_cascader') {
                fetchRemoteCascader(props, states.value)
            }

            if (props.type === 'drag_images') {
                nextTick().then(() => {
                    let ele = document.getElementById(props.path.join('_') + "_drag_images")
                    if (ele) {
                        Sortable.create(ele,
                            {
                                onEnd: function (evt) {
                                    let items = _.get(props.resource, props.path).toSorted((a, b) => a.index < b.index ? 1 : -1);
                                    var element = items[evt.oldIndex];
                                    items = items.toSpliced(evt.oldIndex, 1).toSpliced(evt.newIndex, 0, element);
                                    items.forEach((item, i) => item.index = i)
                                    onChange(props.path, items);
                                }
                            }
                        );
                    }
                })
            }
        }

        const onChange = (path, newValue) => {
            emit('change', path, newValue);

            if (props.type === 'association' || props.type === 'associations' || props.type === 'drag_images') {
                let submitPath = props.path.toSpliced(props.path.length - 1, 1, props.path[props.path.length - 1] + '_attributes');
                let newPath = [...submitPath, ...path.slice(submitPath.length, path.length)]
                emit('changeSubmit', newPath, newValue);
            } else {
                emit('changeSubmit', path, newValue);
            }
        }

        onMounted(() => {
            initialize();
        })

        return () => {
            if (props.render)
                return props.render(props)
            else if (props.type === 'hidden')
                return (<el-col span={0}></el-col>)
            else if (props.condition && !props.condition(props.resource))
                return (<el-col span={0}></el-col>)
            else if (props.type === 'association')
                return (
                    <el-col span={24}>
                        <el-row gutter={20}>
                            {states.value && renderAssociation(props, states.value, onChange)}
                        </el-row>
                    </el-col>
                )
            else if (props.type === 'associations')
                return (
                    <el-col span={24}>
                        <el-row gutter={20}>
                            {states.value && renderAssociations(props, states.value, onChange)}
                        </el-row>
                    </el-col>
                )
            else {
                return (
                    <el-col span={props.span}>
                        <el-form-item label={props.label} prop={props.path} rules={props.rules}>
                            {states.value && renderItem(props, states.value, onChange)}
                            {props.tips && <span className="resource-tips">{props.tips}</span>}
                        </el-form-item>
                    </el-col>
                )
            }
        }
    }
})