// import { Template } from 'meteor/templating';
// import { ReactiveVar } from 'meteor/reactive-var';
//
// import './main.html';

Comments = new Mongo.Collection('comments');

Feeds = new Meteor.Collection('feeds');

Router.route('/', {
    name: 'home',
    template: 'home'
});
Router.route('/register');
Router.route('/login');
Router.route('/feeds');
Router.route('/feed/:name', {
    name: 'feedPage',
    template: 'feedPage',
    data: function() {
        var currentFeed = this.params.name;
        return Feeds.findOne({
            name: currentFeed
        });
    }
});

Router.configure({
    layoutTemplate: 'main'
});

Template.comments.helpers({
    'comment': function() {
        var currentFeed = this._id;
        return Comments.find({
            feedId: currentFeed
        }, {
            sort: {
                createdAt: 1
            }
        });
    }
});

Template.addComment.events({
    'submit form': function(event) {
        event.preventDefault();
        var commentVal = $('[name="commentVal"]').val();
        var currentFeed = this._id;
        var user = Meteor.user();
        var email = user.emails[0].address;
        Comments.insert({
            email: email,
            text: commentVal,
            createdAt: new Date(),
            feedId: currentFeed
        });
        $('[name="commentVal"]').val('');
    }
});

Template.commentText.events({
    'click .delete-comment': function(event) {
        event.preventDefault();
        var commentId = this._id;
        var confirm = window.confirm("Delete this Comment?");
        if (confirm) {
            Comments.remove({
                _id: commentId
            });
        }
    },
    'keyup [name=commentText]': function(event) {
        if (event.which == 13 || event.which == 27) {
            $(event.target).blur();
        } else {
            var commentId = this._id;
            console.log(this);
            var commentVal = $(event.target).val();
            Comments.update({
                _id: commentId
            }, {
                $set: {
                    text: commentVal
                }
            });
        }
    }
});

Template.addFeed.events({
    'submit form': function(event) {
        event.preventDefault();
        var feedName = $('[name=feedName]').val();
        var currentUser = Meteor.userId();
        Feeds.insert({
            name: feedName
        }, function(error, results) {
            if (error) {
                console.log(error.reason);
            } else {
                Router.go('feedPage');
            }
        });
        $('[name=feedName]').val('');
    }
});

Template.feeds.helpers({
    'feed': function() {
        return Feeds.find({}, {
            sort: {
                name: 1
            }
        });
    }
});

Template.register.events({
    'submit form': function(event) {
        event.preventDefault();
    }
});

Template.navigation.events({
    'click .logout': function(event) {
        event.preventDefault();
        Meteor.logout();
        Router.go('login');
    }
});

Template.login.events({
    'submit form': function(event) {
        event.preventDefault();
    }
});

Template.register.onRendered(function() {
    var validator = $('.register').validate({
        submitHandler: function(event) {
            var email = $('[name=email]').val();
            var password = $('[name=password]').val();
            Accounts.createUser({
                email: email,
                password: password
            }, function(error) {
                if (error) {
                    if (error.reason == "Email already exists.") {
                        validator.showErrors({
                            email: "That email already belongs to a registered user."
                        });
                    }
                } else {
                    Router.go("feeds");
                }
            });
        }
    });
});

Template.login.onRendered(function() {
    var validator = $('.login').validate({
        submitHandler: function(event) {
            var email = $('[name=email]').val();
            var password = $('[name=password]').val();
            Meteor.loginWithPassword(email, password, function(error) {
                if (error) {
                    if (error.reason == "User not found") {
                        validator.showErrors({
                            email: "That email doesn't belong to a registered user."
                        });
                    }
                    if (error.reason == "Incorrect password") {
                        validator.showErrors({
                            password: "You entered an incorrect password."
                        });
                    }
                } else {
                    var currentRoute = Router.current().route.getName();
                    if (currentRoute == "login") {
                        Router.go("feeds");
                    }
                }
            });
        }
    });
});

$.validator.setDefaults({
    rules: {
        email: {
            required: true,
            email: true
        },
        password: {
            required: true,
            minlength: 6
        }
    },
    messages: {
        email: {
            required: "You must enter an email address.",
            email: "You've entered an invalid email address."
        },
        password: {
            required: "You must enter a password.",
            minlength: "Your password must be at least {0} characters."
        }
    }
});
