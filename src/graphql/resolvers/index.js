const bcrypt = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

const defaultUserId = '5c9814f8919edb239a989748';


const events = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } });
        return events.map( event => {
            return {
                ...event._doc,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event._doc.creator)
            }
        })
    } catch (err) {
        throw err;
    }
}

const singleEvent = async eventId => {

    try {

        const event = await Event.findById(eventId);

        if (!event) {
            throw new Error('Event not found');
        }

        return {
            ...event._doc,
            date: new Date(event._doc.date).toISOString(),
            creator: user.bind(this, event._doc.creator)
        }

    } catch (err) {
        throw err;
    }

}

const user = async userId => {

    try {
        const user = await User.findById(userId);
        return {
            ...user._doc,
            createdEvents: events.bind(this, user._doc.createdEvents)
        }
    } catch (err) {
        throw err;
    }

}

module.exports = {

    events: async () => {

        try {
            const events = await Event.find();
            return events.map(event => {
                return {
                    ...event._doc,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator)
                }
            })

        } catch (err) {
            throw err;
        }

    },

    bookings: async () => {

        try {

            const bookings = await Booking.find();

            return bookings.map( booking => {
                return { 
                    ...booking._doc,
                    user: user.bind(this, booking._doc.user),
                    event: singleEvent.bind(this, booking._doc.event),
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updatedAt: new Date(booking._doc.updatedAt).toISOString()
                }
            });

        } catch (err) {
            throw err;
        }
    },

    createEvent: async args => {

        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: defaultUserId
        });

        let createdEvent;

        try {

            const result = await event.save();

            createdEvent = {
                ...result._doc,
                date: new Date(result._doc.date).toISOString(),
                creator: user.bind(this, result._doc.creator)
            };

            const creator = await User.findById(defaultUserId);

            if (!creator) {
                throw new Error('User not found');
            }

            creator.createdEvents.push(event);
            await creator.save();

            return createdEvent;

        } catch (err) {
            throw err;
        }

    },
    createUser: async args => {

        try {

            const existingUser = await User.findOne({ email: args.UserInput.email });
            if (existingUser) {
                throw new Error('User already exists');
            }
            const hashedPassword = await bcrypt.hash(args.UserInput.password, 12);

            const user = new User({
                email: args.UserInput.email,
                password: hashedPassword
            });

            const result = await user.save();

            return { ...result._doc, password: null };

        } catch (err) {
            throw err;
        }


    },

    bookEvent: async args => {

        const fetchedEvent = await Event.findOne({_id: args.eventId});
        const booking = new Booking({
            user: defaultUserId,
            event: fetchedEvent
        });

        const result = await booking.save();

        return {
            ...result._doc,
            event: singleEvent.bind(this, result._doc.event),
            user: user.bind(this, result._doc.user),
            createdAt: new Date(result._doc.createdAt).toISOString(),
            updatedAt: new Date(result._doc.updatedAt).toISOString()
           
        }
    },

    cancelBooking: async args => {

        try {

            const booking = await Booking.findById(args.bookingId).populate('event');
            console.log("Booking: ", booking);
            console.log("booking.event._doc.creator: ", booking.event._doc.creator );
            const event = {
                ...booking.event._doc,
                creator: user.bind(this, booking.event._doc.creator)
            }
            console.log("event: ", event);
            console.log("args.bookingId: ", args.bookingId);
            await Booking.deleteOne({ _id: args.bookingId });
            return event;

        } catch (err) {
            throw err;
        }

    }

}