import setuptools

setuptools.setup(
    name='dotaml',
    packages=setuptools.find_packages(exclude=['docs', 'static', 'templates', 'tests']),
    python_requires='>=3.6',
)
