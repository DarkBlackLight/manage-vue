import {ref, defineComponent} from "vue";
import API from "@/api";
import ResourceDialog from "./ResourceDialog";
import {formatDateTime} from "../../config/tools";
import './ResourceShow.scss';

import _ from 'lodash-es';

import {useI18n} from 'vue-i18n'


const renderColumns = (columns, showResource) => columns.map(column =>
    (<el-descriptions-item label={column.label}>
        {() => {
            if (column.type === 'datetime')
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
            if (column.render)
                return column.render(showResource)
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
    setup(props, {expose}) {
        const {t} = useI18n()

        const resourceDialogRef = ref(null);
        const showResource = ref(null);

        const onShow = (resource) => {
            API[props.resourceConfig.resourceData].get(resource.id).then(response => {
                showResource.value = response.data;
                resourceDialogRef.value.onToggle();
            })
        }

        expose({onShow})

        return () => (
            <ResourceDialog title={props.showConfig.title} ref={resourceDialogRef}>
                {{
                    default: () => <el-descriptions column={1} border class="resource-show">
                        {showResource && renderColumns(props.showConfig.columns, showResource.value)}
                    </el-descriptions>
                }}
            </ResourceDialog>
        )
    }
})