from setuptools import find_packages, setup

package_name = 'kari_UAV_siyi'

setup(
    name=package_name,
    version='0.0.0',
    packages=find_packages(exclude=['test']),
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
    ],
    package_data={package_name: ['siyi_sdk/*']},
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='seungchan',
    maintainer_email='seungchan@kari.re.kr',
    description='TODO: Package description',
    license='TODO: License declaration',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
            'siyi_control_node = kari_UAV_siyi.UAV_siyi_control:main',
            'siyi_stream_node = kari_UAV_siyi.UAV_siyi_stream:main',
        ],
    },
)
