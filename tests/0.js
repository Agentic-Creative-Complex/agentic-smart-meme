function sum(a, b) {
    return a + b;
}
//base test
test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
});

//TODO: Add more tests