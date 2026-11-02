# Desktop pet

[简体中文](pet.md) · English

An animated desktop pet you can click, drag, and hide in the browser.

```toml
[params.pet]
enable = true
name = 'Desktop pet'
nicknames = ['Desktop pet', 'On a break', 'On duty']
```

Click the cat to make it wave or jump. Drag it to move it, or focus it and use the arrow keys. Click its name to change the displayed nickname. Click `×` or press Escape while the cat is focused to hide it; a small cat head appears at the bottom right. Click that to bring it back.

The hidden state is saved in local storage; the position is saved for the current tab. Animation timers stop when the tab is in the background or the pet is hidden. The pet is smaller on mobile.

The sprite sheet is `assets/images/desktop-pet.png`, sized 1536 × 2288. Each cell is 192 × 208, in an eight-column, eleven-row grid. The first nine rows contain 6, 8, 8, 4, 5, 8, 6, 6, and 6 animation frames. The final two rows contain sixteen gaze directions. Keep this layout when replacing the image, or update the frame definitions in `assets/js/pet.js` as well.

Set `enable = false` to remove the pet and its stylesheet and script references from the page.
