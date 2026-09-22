console.log('a');
try {
    await import('next/headers');
    console.log('next/headers ok');
} catch (e) {
    console.log('next/headers fail:', String(e).slice(0, 120));
}
try {
    await import('../src/shared/payload');
    console.log('shared/payload ok');
} catch (e) {
    console.log('shared/payload fail:', String(e).slice(0, 120));
}
console.log('done');
