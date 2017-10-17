import { connect } from 'react-redux';
import VisibilityService from '../services/VisibilityService';
import Link from '../components/Link';

const mapStateToProps = (state, ownProps) => ({
  active: ownProps.filter === state.visibilityFilter,
  onClick: () => VisibilityService.setVisibilityFilter(ownProps.filter)
});

const FilterLink = connect(mapStateToProps)(Link);

export default FilterLink;
