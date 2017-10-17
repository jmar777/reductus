import { createServiceFactory, service, reducer } from '../../../../';

@service('visibility', 'SHOW_ALL')
class VisibilityService {

  @reducer()
  SET_VISIBILITY_FILTER(state, { payload }) {
    return payload;
  }

  setVisibilityFilter(filter) {
    this.dispatch('SET_VISIBILITY_FILTER', filter);
  }

  getVisibilityFilter(state) {
    return this.slice(state);
  }

}

export default VisibilityService.get();
