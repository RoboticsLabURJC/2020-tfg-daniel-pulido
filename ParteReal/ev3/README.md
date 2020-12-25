# GoPiGo3

### RaspberyPi configuration   

1. It is necessary to have the Raspbian OS installed, to install it in a simple way => https://www.raspberrypi.org/software/    

2. You have to install the drivers for the communication of the raspberrypi with the GoPiGo3:   
    - Launch the executable kibotics-drivers/gopigo3/install/install_in_raspberrypi.sh   
    ~~~
        chmod +x install_in_raspberrypi.sh
        ./install_in_raspberrypi.sh
    ~~~

3. Configure static ip(*192.168.1.200*), so that it does not change when the raspberrypi is turned on:   
    - Edit the /etc/dhcpcd.conf file with the command:   
    ~~~
        sudo nano /etc/dhcpcd.conf
    ~~~
    - If we look at the content of the file we will see some commented lines (they start with '#') that have an example of static IP configuration:
    ~~~
         # Example static IP configuration:
         #interface eth0
         #static ip_address=192.168.0.10/24
         #static ip6_address=fd51:42f8:caae:d92e::ff/64
         #static routers=192.168.0.1
         #static domain_name_servers=192.168.0.1 8.8.8.8 fd51:42f8:caae:d92e::1
    ~~~
   - To create our own static IP address, for example for the WiFi interface (wlan0), we copy the commented fragment and modify it by adding:   
   ~~~
        interface wlan0
        static ip_address=192.168.1.200/24
        static routers=192.168.1.1
        static domain_name_servers=192.168.1.1
   ~~~   
   - Once done, we restart the Raspberry Pi with the command:   
   ~~~
        sudo reboot
   ~~~
   - Finally we check that, indeed, we have the IP that we have configured by executing with the command:   
   ~~~
        ifconfig wlan0
   ~~~
   
4. Download directory kibotics-drivers/gopigo3/install/ServerGoPiGo in the RaspberryPi

5. Add the task of launching the flask server whenever the Raspberry Pi starts, to avoid having to launch us every time it starts:   
    - Using the cron service:
    ~~~
        crontab -e
    ~~~
    - Add the task, changing <path> to the path where you downloaded the ServerGoPiGo directory:     
    ~~~
        @reboot python /home/pi/<path>/ServerGoPiGo/server_gopigo.py &
    ~~~
   


