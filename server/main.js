import { Meteor } from 'meteor/meteor';

Comments = new Mongo.Collection('comments');

Feeds = new Meteor.Collection('feeds');

Router.route('/', {
    name: 'home',
    template: 'home'
});
Router.route('/register');
Router.route('/login');
Router.route('/feed/:name', {
    template: 'feedPage',
    data: function () {
        var currentFeed = this.params._id;
        return Feeds.findOne({ _id: currentFeed });
    }
});

Router.configure({
    layoutTemplate: 'main'
});

Meteor.startup(() => {
  // code to run on server at startup
});
