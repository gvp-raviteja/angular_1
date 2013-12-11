#include<stdio.h>
#include<malloc.h>
int bin2dec(char *p)
{
int i=0;
while(*p)
{
i=i<<1;
i=i-48+(int)*p;
p++;
}
return i;
}
int main()
{
int num;
char *c=(char *)malloc(10*sizeof(char));
scanf("%d",&num);
while(num--)
{
scanf("%s",c);
num=bin2dec(c);
printf("%d",num);
}
return 0;
}