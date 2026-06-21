window.authorizePortalAccess = function(state) {

  if (!state) {
    return false;
  }

  if (
    state.studentPortal?.hasAccess === true
  ) {
    return true;
  }

  return false;

};