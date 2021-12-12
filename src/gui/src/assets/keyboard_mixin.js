
const keyboardMixin = targetId => ({

    data: () => ({
        target: String,
        pos: null,
        focus: null,
        card_items: [],
        selector: '.card .layout',
        isItemOpen: false,
        shortcuts: [],
        card: null,
        first_dialog: null,
        keyboard_state: 'DEFAULT'
    }),

    computed: {
        multiSelectActive() {
            return this.$store.getters.getMultiSelect;
        },
        state() {
            return this.keyboard_state;
        }
    },

    watch: {
        keyboard_state(val) {
            this.keyboard_state = val;
            //window.console.debug("state>", this.state);
        }
    },

    methods: {

        cardReindex() {
            this.keyRemaper();

            setTimeout( ()=>{
                this.scrollPos();
            },100 )

            if(this.focus) {
                this.$refs.contentData.checkFocus(this.pos);
            }

        },

        reindexCardItems() {

            let data = document.querySelectorAll("#selector_"+this.target+" .card-item");

            data.forEach((add, i) => {
                add.setAttribute('data-id', i);
            });

            this.card_items = data;
        },

        keyRemaper() {
            let which;
            let temp;
            let card = new Object();


            this.reindexCardItems();

            if (this.multiSelectActive) {
                which = ".multiselect button";
                temp = document.querySelector(".multiselect");
            } else {
                which = ".v-card button";
                temp = this.card_items[this.pos];
            }

            let dialog = this.card_items[this.pos].dataset.type;

            // Multi Select Button
            card.multi_select = document.querySelector(".multiselect button[data-btn='multi_select']");

            // - - -
            card.aggregate = this.card_items[this.pos].querySelector("button[data-button='aggregate']");
            card.select = this.card_items[this.pos].querySelector("input[type='checkbox']");
            card.show = this.card_items[this.pos].querySelector(".card");
            card.id = this.card_items[this.pos].dataset.id;
            card.close = document.querySelector("[data-dialog='" + dialog + "-detail'] [data-btn='close']");
            // Link is always extracted from the news item newdial button, does not work for opening all selected items, but also with opened items
            card.link = this.card_items[this.pos].querySelector(".newdial button[data-btn='link'] a");

            // Speed Dial Toolbar
            card.group = temp.querySelector(which + "[data-btn='group']");
            card.ungroup = temp.querySelector(which + "[data-btn='ungroup']");
            card.analyze = temp.querySelector(which + "[data-btn='new']");
            card.read = temp.querySelector(which + "[data-btn='read']");
            card.important = temp.querySelector(which + "[data-btn='important']");
            card.like = temp.querySelector(which + "[data-btn='like']");
            card.unlike = temp.querySelector(which + "[data-btn='unlike']");
            card.delete = temp.querySelector(which + "[data-btn='delete']");

            card.pos = this.pos;

            this.card = card;
        },

        isSomeFocused() {
            let inputs = document.querySelectorAll("input[type='text']");

            for (let f = 0; f < inputs.length; f++) {
                if (inputs[f] === document.activeElement) {
                    return true;
                }
            }
            return false;
        },

        keyAction(press) {
            //let dialog = document.querySelectorAll(".v-dialog--active").length ? true : false;
            //window.console.debug("keyAction", press);
            // define here, as it's not allowed in the case-switch
            let search_field = document.getElementById('search')

            let keyAlias = '';
            for (let i = 0; i < this.shortcuts.length; i++) {
                // ignore all presses with Ctrl or Alt key, they have a different meaning
                if (! ( press.ctrlKey || press.altKey) && (this.shortcuts[i].character == press.key || this.shortcuts[i].key_code == press.keyCode)) {
                    keyAlias = this.shortcuts[i].alias;
                    break;
                }
            }

            if ( !this.isSomeFocused() ) {
                if (!this.focus) {
                    this.focus = true;
                    this.$refs.contentData.checkFocus(this.pos);
                    setTimeout(()=>{
                        this.keyRemaper();
                    },150);

                } else if(this.state === 'DEFAULT') {
                    switch (keyAlias) {
                        case 'collection_up':
                            press.preventDefault();
                            if (this.pos == 0) {
                                // pass
                            } else {
                                this.pos--;
                                this.$refs.contentData.checkFocus(this.pos);
                                setTimeout(()=>{
                                    this.keyRemaper();
                                },150);

                            }
                            break;
                        case 'collection_down':
                            press.preventDefault();
                            if (this.pos == this.card_items.length - 1) {
                                // pass
                            } else {
                                this.pos++;
                                this.$refs.contentData.checkFocus(this.pos);
                                setTimeout(()=>{
                                    this.keyRemaper();
                                },150);
                            }
                            break;
                        case 'show_item':
                            if (!this.isItemOpen) {
                                //this.keyboard_state = 'SHOW_ITEM';
                                this.card.show.click();
                                this.isItemOpen = true;
                            }
                            break;
                        case 'aggregate_open':
                            if (this.card.aggregate) {
                                this.card.aggregate.click();

                                setTimeout(() => {
                                    //this.keyRemaper();
                                    this.cardReindex();
                                }, 150);
                            }
                            break;
                        case 'selection':
                            if (!this.multiSelectActive) {
                                this.card.multi_select.click();
                                setTimeout(() => {
                                    this.keyRemaper();
                                }, 1);

                                setTimeout(() => {
                                    this.card.select.click();
                                }, 155);
                            } else {
                                this.card.select.click();
                                setTimeout(() => {
                                    if (!document.querySelectorAll("#selector_assess input[type='checkbox'][aria-checked='true']").length) {
                                        this.card.multi_select.click();
                                    }
                                }, 155);

                            }
                            break;

                        case 'read_item':
                            this.card.read.click();
                            break;

                        case 'important_item':
                            this.card.important.click();
                            break;

                        case 'like_item':
                            this.card.like.click();
                            break;

                        case 'unlike_item':
                            this.card.unlike.click();
                            break;

                        case 'delete_item':
                            this.card.delete.click();
                            break;

                        case 'group':
                            this.card.group.click();
                            break;

                        case 'ungroup':
                            this.card.ungroup.click();
                            break;

                        case 'new_product':
                            //this.keyboard_state = 'NEW_PRODUCT';
                            this.card.analyze.click();
                            this.isItemOpen = true;
                            break;

                        case 'open_item_source':
                            console.log('this.card.link:', this.card.link) //eslint-disable-line
                            // opening all selected news items' sources is not yet supprted
                            if (! this.multiSelectActive) {
                                this.card.link.click()
                            }
                            break;

                        case 'open_search':
                            press.preventDefault();
                            search_field.focus()
                            break;
                    }
                } else if(this.state === 'SHOW_ITEM') {
                    switch (keyAlias) {
                        case 'close_item':
                            if(document.activeElement.className !== 'ql-editor') {
                                this.isItemOpen = false;
                                this.keyRemaper();
                                this.card.close.click();
                                this.keyboard_state = 'DEFAULT';
                            }
                            break;

                        case 'read_item':
                            this.card.read.click();
                            break;

                        case 'important_item':
                            this.card.important.click();
                            break;

                        case 'like_item':
                            this.card.like.click();
                            break;

                        case 'unlike_item':
                            this.card.unlike.click();
                            break;

                        case 'delete_item':
                            this.card.delete.click();
                            break;

                        case 'group':
                            this.card.group.click();
                            break;

                        case 'ungroup':
                            this.card.ungroup.click();
                            break;

                        case 'new_product':
                            this.card.analyze.click();
                            this.isItemOpen = true;
                            break;

                        case 'open_item_source':
                            console.log('this.card.link:', this.card.link) //eslint-disable-line
                            this.card.link.click()
                            break;

                        default:
                            break;
                    }
                } else if(this.state === 'NEW_PRODUCT') {
                    switch(keyAlias) {
                        case 'close_item':
                            if(document.activeElement.className !== 'ql-editor') {
                                this.isItemOpen = false;
                                this.keyRemaper();
                                this.card.close.click();
                                this.keyboard_state = 'DEFAULT';
                            }
                            break;
                    }
                }
                this.scrollPos();

            // some item is in focus
            } else {
                if(this.state === 'DEFAULT' && keyAlias === 'close_item') {
                    // Pressing Esc in the search field first clears the search and then removes the focus
                    if(document.activeElement == search_field) {
                        if (search_field.value === '') {
                            // clear the focus
                            search_field.blur()
                        } else {
                            // reset the search value if there is some
                            search_field.value = ''
                            // trigger an input event to apply the value to the search function
                            search_field.dispatchEvent(new Event("input"))
                        }
                    }
                }
            }

            //window.console.debug(this.pos, this.isItemOpen, this.isSomeFocused(), this.focus);
        },

        scrollPos() {
            window.scrollTo(0, document.querySelectorAll("#selector_assess .card-item")[this.pos].offsetTop - 350);
        },

        newPosition(newPos, isFromDetail) {
            this.card_items[this.pos].querySelector(this.selector).classList.remove('focus');

            this.pos = newPos;

            this.card_items[this.pos].querySelector(this.selector).classList.add('focus');
            this.isItemOpen = isFromDetail;
        }
    },

    mounted() {

        this.shortcuts = this.$store.getters.getProfileHotkeys;
        this.pos = 0;
        this.focus = null;

    },

    created() {
        this.target = targetId;
        this.$root.$on('change-state', (_state) => {
            this.keyboard_state = _state;
        });
        this.$root.$on('key-remap', () => {
            setTimeout(()=>{
                this.reindexCardItems();
            },150);
        });
        this.$root.$on('update-pos', (_pos) => {
            this.pos = _pos;
        });
    },

    beforeDestroy() {
        this.$root.$off('change-state');
        this.$root.$off('key-remap');
        this.$root.$off('update-pos');
    }
});

export default keyboardMixin;