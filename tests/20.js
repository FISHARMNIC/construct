let bob = {
    a: 123,
    b: 456,
};

// why is bob being marked as Set(2) { 'js::object', 'js::array<js::number>' } and not just obj??
bob['a'] = 765;
bob.b = 999;
