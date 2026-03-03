import { createRouter, createWebHistory } from 'vue-router'
import Projects from '../views/AIScriptWriting/Projects.vue'
import Editor from '../views/AIScriptWriting/Editor.vue'
import Convert from '../views/ScriptConversion/Convert.vue'
import AIWriteNovel from '../views/AIScriptWriting/AIWriteNovel.vue'
import NovelGenerator from '../views/AIScriptWriting/NovelGenerator.vue'
import ScriptCreative from '../views/CreativeStorm/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/ai-write-novel'
    },
    {
      path: '/projects',
      name: 'projects',
      component: Projects
    },
    {
      path: '/ai-write-novel',
      name: 'ai-write-novel',
      component: AIWriteNovel
    },
    {
      path: '/novel-generator',
      name: 'novel-generator',
      component: NovelGenerator
    },
    {
      path: '/editor/:id',
      name: 'editor',
      component: Editor
    },
    {
      path: '/script-creative',
      name: 'script-creative',
      component: ScriptCreative
    },
    {
      path: '/convert',
      name: 'convert',
      component: Convert
    }
  ]
})

export default router
