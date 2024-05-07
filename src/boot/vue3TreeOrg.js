import { boot } from 'quasar/wrappers'
import vue3TreeOrg from 'vue3-tree-org';
import "vue3-tree-org/lib/vue3-tree-org.css";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ( { app, router} ) => {
  // something to do

  app.use(vue3TreeOrg)
})
