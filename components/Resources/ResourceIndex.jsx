import {ref, defineComponent} from "vue";
import ResourceList from "./ResourceList.jsx";
import ResourceShow from './ResourceShow.jsx';
import ResourceEdit from './ResourceEdit.jsx';
import ResourceNew from './ResourceNew.jsx';


export default defineComponent({
    name: 'ResourceIndex',
    props: {
        resourceConfig: {
            resourceData: String,
            resourceName: String,
            onShow: Function
        },
        listConfig: {
            filters: Array,
            title: String,
            columns: Array
        },
        showConfig: {
            title: String,
            columns: Array
        },
        editConfig: {
            title: String,
            columns: Array
        },
        newConfig: {
            title: String,
            columns: Array
        }
    },
    emits: ['edit-success'],
    setup(props, {expose, emit}) {
        const resourceListRef = ref(null);
        const resourceShowRef = ref(null);
        const resourceEditRef = ref(null);
        const resourceNewRef = ref(null);

        const getResourceList = () => {
            resourceListRef.value.getResourceList();
        }

        const getQueries = () => {
            return resourceListRef.value.getQueries();
        }

        const onEditSuccess = (resource, resourceOld) => {
            resourceListRef.value.getResourceList();
            emit('edit-success', resource, resourceOld)
        }

        expose({getResourceList, getQueries, resourceShowRef, resourceEditRef, resourceNewRef})

        return () => (
            <>
                {props.showConfig && !props.resourceConfig.onShow &&
                    <ResourceShow ref={resourceShowRef}
                                  resourceConfig={props.resourceConfig}
                                  showConfig={props.showConfig}
                    />}

                {props.editConfig && !props.resourceConfig.onEdit &&
                    <ResourceEdit ref={resourceEditRef}
                                  resourceConfig={props.resourceConfig}
                                  editConfig={props.editConfig}
                                  onSuccess={onEditSuccess}
                    />}

                {props.newConfig && !props.resourceConfig.onNew &&
                    <ResourceNew ref={resourceNewRef}
                                 resourceConfig={props.resourceConfig}
                                 newConfig={props.newConfig}
                                 onSuccess={() => resourceListRef.value.getResourceList()}
                    />}

                <ResourceList ref={resourceListRef}
                              listConfig={props.listConfig}
                              resourceConfig={props.resourceConfig}
                              onNew={() => props.resourceConfig.onNew ?
                                  props.resourceConfig.onNew() : resourceNewRef.value.onNew()}
                              onShow={(resource) => props.resourceConfig.onShow ?
                                  props.resourceConfig.onShow(resource) : resourceShowRef.value.onShow(resource)}
                              onEdit={(resource) => props.resourceConfig.onEdit ?
                                  props.resourceConfig.onEdit(resource) : resourceEditRef.value.onEdit(resource)
                              }
                />
            </>
        )
    }
})