import { withReactive } from '@/reactive/withReactive';
import { HomeView } from './HomeView';

const queries = () => ({
  nodes: {
    collection: 'nodes',
  }
});

const init = ({ services }) => {
  services.nodeService.fetchNodes();
};

export const HomeController = withReactive(HomeView, {
  queries,
  init,
  monitors: ['fetchNodes']
});
