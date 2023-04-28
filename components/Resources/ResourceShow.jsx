import {ref, defineComponent} from "vue";
import API from "@/api";
import ResourceDialog from "./ResourceDialog";
import {formatDateTime} from "@/utils/tools";
import _ from 'lodash';


const renderColumns = (columns, showResource) => columns.map(column =>
    (<el-descriptions-item label={column.label}>
        {() => {
            if (column.type === 'datetime')
                return formatDateTime(_.get(showResource, column.prop))
            else if (column.type === 'image')
                return (
                    _.get(showResource, column.prop) &&
                    <img height={100} src={_.get(showResource, column.prop).src}/>
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
                    default: () => <el-descriptions column={1}>
                        {showResource && renderColumns(props.showConfig.columns, showResource.value)}
                    </el-descriptions>
                }}
            </ResourceDialog>
        )
    }
})