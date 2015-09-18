Shortly.Link = Backbone.Model.extend({
  urlRoot: '/links',
  initialize: function() {
    console.log('new link');
    console.log(this);
  }
});
