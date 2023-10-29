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
            resourceName: String
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
    setup(props, {expose}) {
        const resourceListRef = ref(null);
        const resourceShowRef = ref(null);
        const resourceEditRef = ref(null);
        const resourceNewRef = ref(null);

        function getResourceList() {
            resourceListRef.value.getResourceList();
        }

        expose({getResourceList})

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
                                  onSuccess={() => resourceListRef.value.getResourceList()}
                    />}

                {props.newConfig && !props.resourceConfig.onNew &&
                    <ResourceNew ref={resourceNewRef}
                                 resourceConfig={props.resourceConfig}
                                 newConfig={props.newConfig}
                                 onSuccess={() => resourceListRef.value.getResourceList()}
                    />}

                <ResourceList ref={resourceListRef}
                              resourceConfig={props.resourceConfig}
                              listConfig={props.listConfig}
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