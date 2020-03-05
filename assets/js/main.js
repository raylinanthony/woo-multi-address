;
(function($) {
    $(function() {

        console.log('Woo Multi Address Activated');

        var btn_download = $('button[name="export_all_posts"]'),
            btn_download_val = btn_download.text(),
            body = $('body'),
            cls = 'active',
            headerCart = $('.header .wrap-right .btn-cart .total'),
            countDownDiv = $('.countdown_order'),
            end_delivery_cls = 'end-delivery',
            table_orders = $('.post-type-shop_order .wp-list-table'),
            wooClass = '.woo-multi-address',
            current_date = new Date() ;

         
        if (wooMultiData !== undefined) {

            if (wooMultiData.hasOwnProperty('form_data')) {
                var _form = $('form.form-checkout');

                _form.find('input, select, textarea').each(function() {

                    if ($(this).attr('type') !== 'hidden' && $(this).attr('name') != 'billing_address_name') {
                      //  $(this).val('');
                    }
                })

                setTimeout(() => {
                    Object.entries(wooMultiData.form_data).map(data => {
                        if (_form.find('#' + data[0]).attr('type') != 'hidden') {
                            _form.find('#' + data[0]).val(data[1]);
                        }
                    });
                    sectores_autocomplete_field()
                }, 1000)


            }


        }



        // For RNC 

        $(wooClass + ' #billing_company').attr({
            'type': 'number'
        });
        /* $(wooClass +' #billing_company').on('keyup', function(){
             var rnc_max = 9;

              if ($(this).val().length > rnc_max)
              {
                 $(this).val($(this).val().slice(0, rnc_max)) 
              }
               
          })*/

        $(wooClass + ' form.form-checkout').on('submit', function() {
            _btn = $('button.save_address');
            _btn.text(_btn.attr('data-after-send')).attr('disabled', 'disabled');
        })


        if ($(wooClass + ' .form-row label .required').length > 0) {
            $(wooClass + ' .form-row label .required').each(function() {
                $(this).closest('.form-row').find('select, input').attr({
                    'required': 'required'
                });
            });
        }



        if (table_orders.length > 0) {

            table_orders.find('tr').each(function() {

                if ($(this).find('.invoice-number').hasClass('order-open')) {
                    $(this).closest('tr').find('td').css('background-color', '#f9e2bb');
                }

            })
        }



        if (countDownDiv.length > 0) {
            var minute = countDownDiv.attr('data-countdown-minutes'),
                minutes = 60 * minute;

            startCountdown(minutes, countDownDiv);

        }


        /** Show a countdown when a delivery is on way**/
        function startCountdown(duration, display) {
            var timer = duration,
                minutes, seconds;
            window.intv = setInterval(function() {

                minutes = parseInt(timer / 60, 10);
                seconds = parseInt(timer % 60, 10);

                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;

                display.find('time').text(minutes + ":" + seconds);


                /** When timer end show the other panel and stop interval **/
                if (--timer < 0) {
                    display.addClass(end_delivery_cls);
                    window.clearInterval(intv);
                    timer = duration;
                }


            }, 1000);
        }



        //Add to cart trigger for adding total to header cart
        body.on('add_to_cart added_to_cart', function(event) {
            if (headerCart.length > 0) {
                var data = {
                    'action': 'cart_count_retriever'
                };


                jQuery.post(hola.ajax_url, data, function(response) {
                    console.log('Got this from the server: ' + response);
                });
                //headerCart.text(' ass')
            }
        });

        setTimeout(function() {
            countDownDiv.addClass(cls)
        }, 1000);

        /** Close CountDown **/
        countDownDiv.find('.icon-close').on('click', function() {

            //if(countDownDiv.hasClass(end_delivery_cls))  	
            countDownDiv.removeClass(cls);
            return false;
        })




        variations(); //Execute variations for products

        function sectores_autocomplete_field() {
            // billing state
            var yao_billing_state = document.getElementById('billing_state');
            if (yao_billing_state) {

                // Regiones para sectores Delivery

                var default_yao_sectores_posts = $.grep(yao_sectores_posts, function(n, i) {
                    return ($(yao_billing_state).val() == n.region);
                });


                var sector_instance = $('.yao-custom-validation-sector input[type="text"]').attr('yao-valid', 'false').autocomplete({
                    source: default_yao_sectores_posts,
                    create: function(event, ui) {
                        setTimeout(function() {
                            $('.yao-custom-validation-sector input[type="text"]').val('');
                        }, 500);
                    },
                    select: function(event, ui) {
                        var current_time = current_date.getHours() + '' + (current_date.getMinutes() < 10 ? '0' + current_date.getMinutes() : current_date.getMinutes());

                        if (current_time > ui.item.limit && current_time < "2300" && $('body.woocommerce-multi-address').length == 0) {
                            alert('En este momento el delivery no esta disponible para tu sector. Puedes pasar a recoger la orden por la sucursal mas cercana.');

                            setTimeout(function() {
                                $('.yao-custom-validation-sector input[type="text"]').val('');
                            }, 500);

                            return;
                        }
                        $('.yao-custom-validation-sector input[type="text"]').attr('yao-valid', 'true');

                    }
                }).on('focusin', function(event) {
                    $(this).attr('yao-valid', 'false');
                }).on('focusout', function(event) {
                    if (this.value) {
                        for (var i = 0; i < default_yao_sectores_posts.length; i++) {
                            if (this.value == default_yao_sectores_posts[i]['value']) {
                                //console.log(default_yao_sectores_posts[i],default_yao_sectores_posts[i]['value'],  this.value.toLowerCase() == default_yao_sectores_posts[i]['value'].toLowerCase() );
                                $(this).attr('yao-valid', 'true');

                                var _html = 'Recibiras tu pedido desde: <strong>' + default_yao_sectores_posts[i]['sucursal_name'] + '</strong><input type="hidden" name="sucursal_recoger_pedido" value="' + default_yao_sectores_posts[i]['sucursal'] + '" />',
                                    sucursalItem = $('.sucursal-item');


                                if (sucursalItem.length > 0) {
                                    sucursalItem.html(_html);
                                } else {
                                    $('<div class="sucursal-item">' + _html + '</div>').insertAfter($(this));
                                }

                            }
                        }
                    }
                    if (this.value && $(this).attr('yao-valid') == 'false') {
                        var _parent = $(this).closest('.woocommerce-input-wrapper');
                        _parent.append('<div class="disclaim">Lo sentimos, no enviamos a este sector. Por favor escoge otro sector disponible</div>');
                        var _this = $(this);
                        setTimeout(function() {
                            _this.val('');

                        }, 500);
                        setTimeout(function() {
                            _parent.find('.disclaim').remove();

                        }, 3000);


                    }
                });

                // Process delivery sectors:
                $(yao_billing_state).on('change', function(event) {
                    var selected_region = $(this).val();
                    var default_yao_sectores_posts = $.grep(yao_sectores_posts, function(n, i) {
                        return (selected_region == n.region);
                    });
                    $('.yao-custom-validation-sector input[type="text"]').val('');
                    $('.yao-custom-validation-sector input[type="text"]').autocomplete("option", "source", default_yao_sectores_posts);
                    // console.log( 'Changed' );
                });
            }
        }

        function variations() {

            var json = ["Aperitivo: (2) Egg Rolls, ninja-fuerte: Kakareo de 8, Bebida: Coca Cola 16oz, Guarnici\u00f3n: No aplica", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Kakareo de 8, Bebida: Ice Tea, Guarnici\u00f3n: No aplica", "Aperitivo: Wonton al Vapor, ninja-fuerte: Waka Waka Keiniku (pollo), Bebida: Agua Dasani, Guarnici\u00f3n: No aplica", "Aperitivo: Wonton al Vapor, ninja-fuerte: Waka Waka Keiniku (pollo), Bebida: Coca Cola 16oz, Guarnici\u00f3n: No aplica", "Aperitivo: Wonton Frito, ninja-fuerte: Blancanieves de 8, Bebida: Agua Dasani, Guarnici\u00f3n: No aplica", "Aperitivo: Wonton al Vapor, ninja-fuerte: Chow Fan Mixto, Bebida: Coca Cola 16oz, Guarnici\u00f3n: No aplica", "Aperitivo: Wonton al Vapor, ninja-fuerte: Chow Fan Mixto, Bebida: Agua Dasani, Guarnici\u00f3n: No aplica", "Aperitivo: Wonton al Vapor, ninja-fuerte: Chow Fan Mixto, Bebida: Ice Tea, Guarnici\u00f3n: No aplica", "Aperitivo: Wonton Frito, ninja-fuerte: Chow Fan Mixto, Bebida: Agua Dasani, Guarnici\u00f3n: No aplica", "Aperitivo: Wonton Frito, ninja-fuerte: Chow Fan Mixto, Bebida: Coca Cola 16oz, Guarnici\u00f3n: No aplica", "Aperitivo: Wonton Frito, ninja-fuerte: Chow Fan Mixto, Bebida: Ice Tea, Guarnici\u00f3n: No aplica", "Aperitivo: Wonton Frito, ninja-fuerte: Blancanieves de 8, Bebida: Ice Tea, Guarnici\u00f3n: No aplica", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Blancanieves de 8, Bebida: Coca Cola 16oz, Guarnici\u00f3n: No aplica", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Blancanieves de 8, Bebida: Agua Dasani, Guarnici\u00f3n: No aplica", "Aperitivo: Wonton Frito, ninja-fuerte: Blancanieves de 8, Bebida: Coca Cola 16oz, Guarnici\u00f3n: No aplica", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Blancanieves de 8, Bebida: Ice Tea, Guarnici\u00f3n: No aplica", "Aperitivo: Wonton Frito, ninja-fuerte: Kakareo de 8, Bebida: Agua Dasani, Guarnici\u00f3n: No aplica", "Aperitivo: Wonton Frito, ninja-fuerte: Kakareo de 8, Bebida: Coca Cola 16oz, Guarnici\u00f3n: No aplica", "Aperitivo: Wonton Frito, ninja-fuerte: Kakareo de 8, Bebida: Ice Tea, Guarnici\u00f3n: No aplica", "Aperitivo: Wonton al Vapor, ninja-fuerte: Waka Waka Keiniku (pollo), Bebida: Ice Tea, Guarnici\u00f3n: No aplica", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Res con Puerro y Jenjibre, Bebida: Agua Dasani, Guarnici\u00f3n: Arroz Frito", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Res con Puerro y Jenjibre, Bebida: Coca Cola 16oz, Guarnici\u00f3n: Arroz Blanco", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Res con Puerro y Jenjibre, Bebida: Coca Cola 16oz, Guarnici\u00f3n: Arroz Frito", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Res con Puerro y Jenjibre, Bebida: Ice Tea, Guarnici\u00f3n: Arroz Blanco", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Res con Puerro y Jenjibre, Bebida: Ice Tea, Guarnici\u00f3n: Arroz Frito", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Blancanieves de 8, Bebida: Agua Dasani, Guarnici\u00f3n: No aplica", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Blancanieves de 8, Bebida: Coca Cola 16oz, Guarnici\u00f3n: No aplica", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Blancanieves de 8, Bebida: Ice Tea, Guarnici\u00f3n: No aplica", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Kakareo de 8, Bebida: Agua Dasani, Guarnici\u00f3n: No aplica", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Cerdo Teriyaki, Bebida: Ice Tea, Guarnici\u00f3n: Arroz Frito", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Chow Fan Mixto, Bebida: Agua Dasani, Guarnici\u00f3n: No aplica", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Chow Fan Mixto, Bebida: Coca Cola 16oz, Guarnici\u00f3n: No aplica", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Chow Fan Mixto, Bebida: Ice Tea, Guarnici\u00f3n: No aplica", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Pechuguitas, Bebida: Agua Dasani, Guarnici\u00f3n: Arroz Blanco", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Pechuguitas, Bebida: Agua Dasani, Guarnici\u00f3n: Arroz Frito", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Pechuguitas, Bebida: Coca Cola 16oz, Guarnici\u00f3n: Arroz Blanco", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Pechuguitas, Bebida: Coca Cola 16oz, Guarnici\u00f3n: Arroz Frito", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Pechuguitas, Bebida: Ice Tea, Guarnici\u00f3n: Arroz Blanco", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Pechuguitas, Bebida: Ice Tea, Guarnici\u00f3n: Arroz Frito", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Res con Puerro y Jenjibre, Bebida: Agua Dasani, Guarnici\u00f3n: Arroz Blanco", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Waka Waka Keiniku (pollo), Bebida: Agua Dasani, Guarnici\u00f3n: No aplica", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Waka Waka Keiniku (pollo), Bebida: Coca Cola 16oz, Guarnici\u00f3n: No aplica", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Waka Waka Keiniku (pollo), Bebida: Ice Tea, Guarnici\u00f3n: No aplica", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Pollo Teriyaki, Bebida: Agua Dasani, Guarnici\u00f3n: Arroz Blanco", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Pollo Teriyaki, Bebida: Agua Dasani, Guarnici\u00f3n: Arroz Frito", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Pollo Teriyaki, Bebida: Coca Cola 16oz, Guarnici\u00f3n: Arroz Blanco", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Pollo Teriyaki, Bebida: Coca Cola 16oz, Guarnici\u00f3n: Arroz Frito", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Pollo Teriyaki, Bebida: Ice Tea, Guarnici\u00f3n: Arroz Blanco", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Pollo Teriyaki, Bebida: Ice Tea, Guarnici\u00f3n: Arroz Frito", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Cerdo Teriyaki, Bebida: Agua Dasani, Guarnici\u00f3n: Arroz Blanco", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Cerdo Teriyaki, Bebida: Agua Dasani, Guarnici\u00f3n: Arroz Frito", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Cerdo Teriyaki, Bebida: Coca Cola 16oz, Guarnici\u00f3n: Arroz Blanco", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Cerdo Teriyaki, Bebida: Coca Cola 16oz, Guarnici\u00f3n: Arroz Frito", "Aperitivo: (2) Egg Rolls, ninja-fuerte: Cerdo Teriyaki, Bebida: Ice Tea, Guarnici\u00f3n: Arroz Blanco"]


            var _variations = $('table.variations tr:first-child select');

            _variations.on('change', function() {

                var currValue = $(this).children("option:selected").text(),
                    acumVals = [];

                if (currValue == '') {
                    _variations.val('')
                }
                $.each(json, function(i, v) {
                    if (v.includes(currValue)) {
                        acumVals.push(v.trim())
                    }
                })

                $('table.variations tr:not(:first-child) select').val('').find('option').each(function() {
                    var _this = $(this),
                        bb = 0;
                    _this.addClass('hide');
                    $.each(acumVals, function(i, v) {
                        if (v.includes(_this.text().trim())) {
                            bb += 1;

                        }

                    });

                    if (bb > 0) {
                        _this.removeClass('hide');
                    }

                })
            });

        }

    })
})(jQuery);