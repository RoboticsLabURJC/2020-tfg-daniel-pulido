# Ev3

    ~~~

3. Configure static ip(*10.142.0.1*), so that it does not change when the Ev3 is turned on:   
    - Edit the /etc/dhcpcd.conf file with the command:   
    ~~~
        sudo nano /etc/dhcpcd.conf
    ~~~
    - If we look at the content of the file we will see some commented lines (they start with '#') that have an example of static IP configuration:
    ~~~
         # Example static IP configuration:
         #interface eth0
         #static ip_address=10.142.0.10/24
         #static ip6_address=fd51:42f8:caae:d92e::ff/64
         #static routers=192.168.0.1
         #static domain_name_servers=10.142.0.1 8.8.8.8 fd51:42f8:caae:d92e::1
    ~~~
   - To create our own static IP address, for example for the WiFi interface (wlan0), we copy the commented fragment and modify it by adding:   
   ~~~
        interface wlan0
        static ip_address=10.142.0.200/24
        static routers=10.142.0.1
        static domain_name_servers=10.142.0.1
   ~~~   
   - Once done, we restart with the command:   
   ~~~
        sudo reboot
   ~~~
   - Finally we check that, indeed, we have the IP that we have configured by executing with the command:   
   ~~~
        ifconfig wlan0
   ~~~

    ~~~
