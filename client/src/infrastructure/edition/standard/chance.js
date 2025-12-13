module.exports = [
    {
        id: "ch_advance_to_go",
        text: "Advance to GO. Collect $200.",
        amount: 200,
        moveTo: "go"
    },
    {
        id: "ch_advance_to_illinois",
        text: "Advance to Illinois Avenue.",
        amount: null,
        moveTo: "illinois"
    },
    {
        id: "ch_advance_to_st_charles",
        text: "Advance to St. Charles Place.",
        amount: null,
        moveTo: "st_charles"
    },
    {
        id: "ch_nearest_railroad_1",
        text: "Advance to the nearest Railroad. If unowned, you may buy it from the Bank. If owned, pay the owner twice the rent to which they are otherwise entitled.",
        amount: null,
        moveToNearest: "railroad",
        doubleRent: true
    },
    {
        id: "ch_nearest_railroad_2",
        text: "Advance to the nearest Railroad. If unowned, you may buy it from the Bank. If owned, pay the owner twice the rent to which they are otherwise entitled.",
        amount: null,
        moveToNearest: "railroad",
        doubleRent: true
    },
    {
        id: "ch_nearest_utility",
        text: "Advance token to nearest Utility. If unowned, you may buy it. If owned, throw dice and pay owner 10 times the amount thrown.",
        amount: null,
        moveToNearest: "utility",
        multiplierOnDice: 10
    },
    {
        id: "ch_dividend",
        text: "Bank pays you dividend of $50.",
        amount: 50
    },
    {
        id: "ch_get_out_of_jail_free",
        text: "Get Out of Jail Free. This card may be kept until needed or sold.",
        amount: null,
        jailFree: true
    },
    {
        id: "ch_go_back_three",
        text: "Go back three spaces.",
        amount: null,
        moveRelative: -3
    },
    {
        id: "ch_go_to_jail",
        text: "Go directly to Jail. Do not pass GO. Do not collect $200.",
        amount: null,
        jail: true
    },
    {
        id: "ch_general_repairs",
        text: "Make general repairs on all your property. Pay $25 per house and $100 per hotel.",
        amount: null,
        perHouse: -25,
        perHotel: -100
    },
    {
        id: "ch_speeding_fine",
        text: "Speeding fine. Pay $15.",
        amount: -15
    },
    {
        id: "ch_chairman",
        text: "You have been elected Chairman of the Board. Pay each player $50.",
        amount: null,
        perPlayer: -50
    },
    {
        id: "ch_building_loan_matures",
        text: "Your building loan matures. Collect $150.",
        amount: 150
    },
    {
        id: "ch_crossword_competition",
        text: "You have won a crossword competition. Collect $100.",
        amount: 100
    },
    {
        id: "ch_advance_to_boardwalk",
        text: "Take a walk on the Boardwalk. Advance token to Boardwalk.",
        amount: null,
        moveTo: "boardwalk"
    }
];
