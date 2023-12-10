import About from './aboutView.vue'
import NewPost from './newPostView.vue'
import Credentials from './credentialsView.vue'
import BskyDelete from './bskyDeleteView.vue'

export const routes = [
  { path: '/', name: 'about', component: About },
  { path: '/post', name: 'new-post', component: NewPost },
  { path: '/credentials', name: 'credentials', component: Credentials },
  { path: '/bsky-delete', name: 'bsky-delete', component: BskyDelete }
]
