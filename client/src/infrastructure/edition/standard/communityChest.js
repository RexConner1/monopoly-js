module.exports = [
    {
        id: "cc_bank_error",
        text: "Bank error in your favor. Collect $200.",
        amount: 200
    },
    {
        id: "cc_doctors_fees",
        text: "Doctor's fees. Pay $50.",
        amount: -50
    },
    {
        id: "cc_stock_sale",
        text: "From sale of stock you get $50.",
        amount: 50
    },
    {
        id: "cc_get_out_of_jail_free",
        text: "Get Out of Jail Free. This card may be kept until needed or sold.",
        amount: null,
        jailFree: true
    },
    {
        id: "cc_go_to_jail",
        text: "Go directly to Jail. Do not pass GO. Do not collect $200.",
        amount: null,
        jail: true
    },
    {
        id: "cc_holiday_fund",
        text: "Holiday fund matures. Receive $100.",
        amount: 100
    },
    {
        id: "cc_income_tax_refund",
        text: "Income tax refund. Collect $20.",
        amount: 20
    },
    {
        id: "cc_life_insurance",
        text: "Life insurance matures. Collect $100.",
        amount: 100
    },
    {
        id: "cc_hospital_fees",
        text: "Hospital fees. Pay $100.",
        amount: -100
    },
    {
        id: "cc_school_fees",
        text: "School fees. Pay $50.",
        amount: -50
    },
    {
        id: "cc_consultancy_fee",
        text: "Receive $25 consultancy fee.",
        amount: 25
    },
    {
        id: "cc_street_repairs",
        text: "You are assessed for street repairs: $40 per house, $115 per hotel.",
        amount: null,
        perHouse: -40,
        perHotel: -115
    },
    {
        id: "cc_beauty_contest",
        text: "You have won second prize in a beauty contest. Collect $10.",
        amount: 10
    },
    {
        id: "cc_inherit_100",
        text: "You inherit $100.",
        amount: 100
    },
    {
        id: "cc_chairman_fee",
        text: "You have been elected Chairman of the Board. Pay each player $50.",
        amount: null,
        perPlayer: -50
    },
    {
        id: "cc_advance_to_go",
        text: "Advance to GO. Collect $200.",
        amount: 200,
        moveTo: "go"
    }
];
