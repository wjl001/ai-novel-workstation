import { createRouter, createWebHistory } from 'vue-router'
import Projects from '../views/AIScriptWriting/Projects.vue'
import Editor from '../views/AIScriptWriting/Editor.vue'
import Convert from '../views/ScriptConversion/Convert.vue'
import AIWriteNovel from '../views/AIScriptWriting/AIWriteNovel.vue'
import NovelGenerator from '../views/AIScriptWriting/NovelGenerator.vue'        
import ScriptCreative from '../views/CreativeStorm/index.vue'
import AIScript from '../views/AIShortDrama/ScriptView.vue'
import AIVideo from '../views/AIShortDrama/VideoView.vue'
import AIDramaHome from '../views/AIDrama/HomeView.vue'
import OutlineView from '../views/AIShortDrama/OutlineView.vue'
import AssetsView from '../views/AIShortDrama/AssetsView.vue'
import EpisodesView from '../views/AIShortDrama/EpisodesView.vue'
import DramaWorks from '../views/AIShortDrama/DramaWorks.vue'
import NewDrama from '../views/AIShortDrama/NewDrama.vue'
import DramaCreatorLayout from '../views/AIShortDrama/DramaCreatorLayout.vue'
import StoryboardView from '../views/AIShortDrama/StoryboardView.vue'
import TeamManagementView from '../views/TeamManagement/TeamManagementView.vue'

// Placeholder component for the new workflow
const UnderConstruction = { template: '<div class="p-8 text-center text-lg">正在建设中...</div>' };

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth/login',
      name: 'login',
      component: () => import('../views/auth/Login.vue')
    },
    {
      path: '/auth/sso',
      name: 'sso-auth',
      component: () => import('../views/auth/SsoAuth.vue')
    },
    {
      path: '/',
      redirect: '/ai-short-drama-creator/new'
    },
    {
      path: '/home',
      name: 'home',
      component: AIDramaHome
    },
    {
      path: '/ai-script',
      name: 'ai-script',
      component: AIScript
    },
    {
      path: '/ai-video',
      name: 'ai-video',
      component: AIVideo
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
    },
    {
      path: '/ai-short-drama-creator/works',
      name: 'drama-works',
      component: DramaWorks
    },
    {
      path: '/ai-short-drama-creator/new',
      name: 'drama-new',
      component: NewDrama
    },
    {
      path: '/ai-short-drama-creator/episodes',
      name: 'drama-episodes-list',
      component: EpisodesView
    },
    {
      path: '/team-management',
      name: 'team-management',
      component: TeamManagementView
    },
    {
      path: '/ai-short-drama-creator',
      component: DramaCreatorLayout,
      children: [
        {
          path: 'outline',
          name: 'drama-outline',
          component: OutlineView
        },
        {
          path: 'assets',
          name: 'drama-assets',
          component: AssetsView
        },
        {
          path: 'storyboard',
          name: 'drama-storyboard',
          component: StoryboardView
        }
      ]
    }
  ]
})

export default router
